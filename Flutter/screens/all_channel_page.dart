import 'package:fanfareapp/global/global_constant.dart';
import 'package:fanfareapp/routes/app_pages.dart';
import 'package:fanfareapp/screen/chat/enums/enums.dart';
import 'package:fanfareapp/screen/chat/user_chat_page.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:sizer/sizer.dart';
import '../../Utilities/popup_menu_tile.dart';
import '../../generated/assets.dart';
import '../../global/date_time_utils.dart';
import 'controller/all_channel_controller.dart';
import 'widget/channel/channel_list_item.dart';

class AllChannelView extends GetView<AllChannelController> {
  const AllChannelView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Channels',
          style: TextStyle(color: Colors.black, fontSize: 16),
        ),
        actions: [
          IconButton(
            onPressed: () {
              Get.toNamed(Routes.CHANNEL_SEARCH);
            },
            icon: Icon(
              Icons.search,
              color: Colors.black38,
            ),
          ),
          PopupMenuButton(
            padding: const EdgeInsets.only(right: 12),
            offset: const Offset(0, 40),
            icon: Icon(
              Icons.more_vert_outlined,
              color: const Color(0xffEE2409).withOpacity(0.7),
              size: 3.7.h,
            ),
            itemBuilder: (context) {
              return [
                PopupMenuItem<int>(
                  value: 0,
                  child: PopupMenuTile(
                    name: "Create Channel",
                    img: Assets.svgChannelCircle,
                    crossAxisAlignment: CrossAxisAlignment.end,
                  ),
                ),
              ];
            },
            onSelected: (value) {
              if (value == 0) {
                Get.toNamed(Routes.CREATE_CHANNEL);
              }
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _MyChannels(),
            _SuggestedChannels(),
          ],
        ),
      ),
    );
  }
}

class _SuggestedChannels extends GetView<AllChannelController> {
  const _SuggestedChannels();

  @override
  Widget build(BuildContext context) {
    return GetBuilder<AllChannelController>(
      id: controller.suggestedChannelKey,
      builder: (controller) {
        if (controller.suggestedChannel.isEmpty) {
          return SizedBox.shrink();
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 20),
            _ListHeader(title: "Suggested Channel"),
            ListView.separated(
              physics: NeverScrollableScrollPhysics(),
              itemCount: controller.suggestedChannel.length,
              shrinkWrap: true,
              itemBuilder: (_, index) {
                final channel = controller.suggestedChannel[index];
                return ChannelListItem(
                  imageUrl: channel.imageUrl,
                  title: channel.name,
                  subtitle: "${channel.followerCount ?? ""} Followers",
                  onTap: () {
                    final userId = HelperUtils.getUserID();
                    if (userId == null) return;

                    Get.toNamed(
                      Routes.CHAT,
                      arguments: ChatPageArguments(
                        currentUserID: userId,
                        userName: "",
                        conversationID: channel.id,
                        chatType: ChatType.channel.name,
                      ),
                    );
                  },
                  trailingButtonText: "Follow",
                  trailingButtonTap: () {
                    HelperUtils.showLoaderDialog(context);

                    controller.followChannel(channel).then(
                      (response) {
                        Get.back();
                        if (response == true) {
                          controller.removeSuggestedChannel(channel);
                          controller.onFollowChannel(channel);
                        }
                      },
                    );
                  },
                );
              },
              separatorBuilder: (context, index) => const Divider(height: 8),
            ),
            if (controller.suggestedChannel.length >= 10)
              Center(
                child: TextButton(
                  onPressed: () {
                    Get.toNamed(Routes.VIEW_MORE_CHANNELS, arguments: ChannelViewType.suggested);
                  },
                  child: Text(
                    "View All",
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              )
          ],
        );
      },
    );
  }
}

class _MyChannels extends GetView<AllChannelController> {
  const _MyChannels();

  @override
  Widget build(BuildContext context) {
    return Obx(
      () {
        if (controller.isLoading.value) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        } else if (controller.channelList.isEmpty) {
          return SizedBox.shrink();
        } else {
          final allChannels = controller.channelList.values.toList();

          allChannels.sort((a, b) {
            final bTimestamp = b.channelDetailsModel.lastMessageTimestamp ?? DateTime.fromMillisecondsSinceEpoch(0);
            final aTimestamp = a.channelDetailsModel.lastMessageTimestamp ?? DateTime.fromMillisecondsSinceEpoch(0);
            return bTimestamp.compareTo(aTimestamp);
          });

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(height: 20),
              _ListHeader(title: "My Channel"),
              ListView.separated(
                physics: NeverScrollableScrollPhysics(),
                itemCount: allChannels.length,
                shrinkWrap: true,
                itemBuilder: (_, index) {
                  final channel = allChannels[index].channelDetailsModel;
                  return ChannelListItem(
                    trailingText: DateTimeUtils.formatTime(channel.lastMessageTimestamp),
                    imageUrl: channel.imageUrl,
                    title: channel.name,
                    subtitle: channel.lastMessage,
                    isBoldSubtitle: allChannels[index].isMessageUnseen,
                    onTap: () {
                      final userId = HelperUtils.getUserID();
                      if (userId == null) return;

                      Get.toNamed(
                        Routes.CHAT,
                        arguments: ChatPageArguments(
                          currentUserID: userId,
                          userName: "",
                          conversationID: channel.id,
                          chatType: ChatType.channel.name,
                        ),
                      );
                    },
                  );
                },
                separatorBuilder: (context, index) => const Divider(height: 8),
              ),
              if (allChannels.length >= 10)
                Center(
                  child: TextButton(
                    onPressed: () {
                      Get.toNamed(Routes.VIEW_MORE_CHANNELS, arguments: ChannelViewType.myChannel);
                    },
                    child: Text(
                      "View All",
                      style: TextStyle(color: Colors.grey),
                    ),
                  ),
                )
            ],
          );
        }
      },
    );
  }
}

class _ListHeader extends StatelessWidget {
  const _ListHeader({
    required this.title,
  });

  final String title;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(left: 20, right: 20, bottom: 10),
      child: Text(
        title,
        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: Colors.grey),
      ),
    );
  }
}
