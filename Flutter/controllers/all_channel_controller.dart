import 'dart:async';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:fanfareapp/Utilities/firebase_db.dart';
import 'package:fanfareapp/screen/chat/model/channel_details_model.dart';
import 'package:fanfareapp/screen/chat/repository/chat_repository.dart';
import 'package:get/get.dart';

import '../../../Utilities/notification_services.dart';
import '../../../global/date_time_utils.dart';
import '../../../global/dependency_injection.dart';
import '../../../global/globalHiveService.dart';
import '../../../global/global_constant.dart';
import '../../../global/local_channel_repository.dart';
import '../enums/enums.dart';
import '../model/followed_channel_meta_info_model.dart';
import '../model/user_last_message_read_status.dart';

class AllChannelController extends GetxController {
  RxMap<String, ChannelDetailsWitSeenStatus> channelList = <String, ChannelDetailsWitSeenStatus>{}.obs;
  RxBool isLoading = true.obs;
  List<FollowedChannelMetaInfoModel> followedChannelsMeta = [];

  List<ChannelDetailsModel> suggestedChannel = [];
  final String suggestedChannelKey = "suggestedChannelKey";

  final chatRepository = sl.get<ChatRepository>();
  late LocalChannelRepository localChannelRepository;

  @override
  void onInit() {
    super.onInit();
    localChannelRepository = LocalChannelRepositoryImpl(GlobalHiveService.followedChannelBox);
    _fetchChannels();
    _fetchSuggestedChannel();
  }

  Future<void> _fetchChannels() async {
    final userId = HelperUtils.getUserID();
    if (userId == null) return;

    followedChannelsMeta = await FirebaseDB.getFollowedChannels(userId);

    final List<Future<void>> tasks = [];

    for (var channelMeta in followedChannelsMeta) {
      tasks.add(() async {
        final channelId = channelMeta.channelId;

        final channelDetailsFuture = FirebaseDB.getChannelDetails(channelId);
        final messageSeenStatusFuture = FirebaseDB.getUserLastSeenMessageStatus(
          conversationId: channelId,
          chatType: ChatType.channel.name,
          userId: userId,
        );

        final results = await Future.wait([channelDetailsFuture, messageSeenStatusFuture]);

        final channelDetails = results[0] as ChannelDetailsModel?;
        final messageSeenStatus = results[1] as UserLastSeenMessageReadStatus?;

        if (channelDetails != null) {
          final userLastSeenTimestamp = (messageSeenStatus?.messageSeenTime as Timestamp?)?.toDate();
          bool isMessageUnseen = false;

          if (userLastSeenTimestamp != null && channelDetails.lastMessageTimestamp != null) {
            isMessageUnseen = DateTimeUtils.isBefore(
              userLastSeenTimestamp,
              channelDetails.lastMessageTimestamp!,
            );
          }

          channelList[channelDetails.id] = ChannelDetailsWitSeenStatus(
            channelDetailsModel: channelDetails,
            isMessageUnseen: isMessageUnseen,
          );
        }
      }());
    }

    await Future.wait(tasks);

    isLoading.value = false;
  }

  _fetchSuggestedChannel() async {
    final response = await sl.get<ChatRepository>().suggestedChannel(origin: "AllChannel", startIndex: 0, endIndex: 9);
    if (response != null) {
      suggestedChannel = response;
      update([suggestedChannelKey]);
    }
  }

  Future<void> refreshChannels() async {
    channelList.clear();
    followedChannelsMeta.clear();
    await _fetchChannels();
  }

  void updateChannelLastMessage({required String channelId, String? message, required String messageType, DateTime? lastMessageTimestamp}) {
    final channelDetails = channelList[channelId];

    final updatedChannelData = channelDetails?.copyWith(
        channelDetailsModel: channelDetails.channelDetailsModel.copyWith(
      lastMessage: message,
      lastMessageType: messageType,
      lastMessageTimestamp: lastMessageTimestamp,
    ));

    if (updatedChannelData != null) {
      channelList[channelId] = updatedChannelData;
    }
  }

  Future<bool?> followChannel(ChannelDetailsModel channelDetails) async {
    final currentUserID = HelperUtils.getUserID();
    if (currentUserID == null) return false;

    final response = await chatRepository.followChannel(channelDetails.id, channelDetails.createdBy ?? "", "Chat/Follow Channel");
    if (response == null) {
      HelperUtils.showToast("Failed to follow channel");
      return false;
    }

    await FirebaseDB.updateChannelFollowStatus(
      channelDetails,
      currentUserID,
      ChannelAction.follow,
    ).then((_) {
      NotificationServices.instance.subscribeToTopic(channelDetails.id);
      localChannelRepository.followChannel(FollowedChannelMetaInfoModel(
        channelId: channelDetails.id,
        createdBy: currentUserID,
        followedAt: channelDetails.createdAt ?? DateTime.now(),
        isSubscribedToNotification: true,
      ));
    });
    return true;
  }

  Future<bool?> unFollowChannel(ChannelDetailsModel channelDetails) async {
    final currentUserID = HelperUtils.getUserID();
    if (currentUserID == null) return false;

    final response = await chatRepository.unFollowChannel(channelDetails.id, "Chat/UnFollow Channel");
    if (response == null) {
      HelperUtils.showToast("Failed to unfollow channel");
      return false;
    }

    await FirebaseDB.updateChannelFollowStatus(
      channelDetails,
      currentUserID,
      ChannelAction.unfollow,
    ).then((_) {
      NotificationServices.instance.unsubscribeFromTopic(channelDetails.id);
      localChannelRepository.unFollowChannel(channelDetails.id);
    });

    return true;
  }

  void onFollowChannel(ChannelDetailsModel channelDetails) {
    final updatedChannelDetails = channelDetails.copyWith(lastMessageTimestamp: DateTime.now());

    final channelDetailsWithSeenStatus = channelList[channelDetails.id];
    channelList[channelDetails.id] = channelDetailsWithSeenStatus!.copyWith(channelDetailsModel: updatedChannelDetails);

    suggestedChannel.removeWhere((channel) => channel.id == channelDetails.id);
    update([suggestedChannelKey]);
  }

  void removeSuggestedChannel(ChannelDetailsModel channelDetails) {
    suggestedChannel.removeWhere((channel) => channel.id == channelDetails.id);
    update([suggestedChannelKey]);
  }

  void onUnFollowChannel(ChannelDetailsModel channelDetails) {
    if (channelList[channelDetails.id] != null) channelList.remove(channelDetails.id);
  }

  void updateMessageSeenStatus({required String channelId, required bool isMessageUnseen}) {
    final channelDetails = channelList[channelId];

    if (channelDetails != null) {
      channelList[channelId] = channelDetails.copyWith(isMessageUnseen: isMessageUnseen);
    }
  }
}
