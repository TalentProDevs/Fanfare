import 'dart:convert';

import '../../../global/dependency_injection.dart';
import '../../search/model/search_user_response.dart';
import '../model/agora_token_request_model.dart';
import '../model/channel_details_model.dart';
import '../model/chat_user_search_model.dart';
import 'chat_query_mutation.dart';

abstract class ChatRepository {
  Future<String?> generateAgoraToken(AgoraTokenRequestModel requestModel, String origin);
  Future<bool?> getUserBlockStatus(String userId, String origin);
  Future<String?> createFfChannel(ChannelDetailsModel channelDetails, String origin);
  Future<String?> updateFfChannel(ChannelDetailsModel channelDetails, String origin);
  Future<List<ChannelDetailsModel>?> searchChannel({required String searchTerm, required int startIndex, required int endIndex, required String origin});
  Future<List<ChannelDetailsModel>?> suggestedChannel({required String origin, required int startIndex, required int endIndex});
  Future<String?> followChannel(String channelId, String createdBy, String origin);
  Future<String?> unFollowChannel(String channelId, String origin);
  Future<ChannelDetailsModel?> findOneChannel(String channelId, String origin);
  Future<List<ChatUserSearchModel>?> searchFriend(String searchTerm, int startIndex, int endIndex, String origin);
  Future<List<ChatUserSearchModel>?> searchSuggestedUser(String searchTerm, int startIndex, int endIndex, String origin);
}

class ChatRepositoryImpl implements ChatRepository {
  @override
  Future<String?> generateAgoraToken(AgoraTokenRequestModel requestModel, String origin) async {
    try {
      final response = await api.call(document: ChatQueryMutation.sendAgoraTokenToUsers, variables: {"sendAgoraTokenInput": requestModel.toJson()}, origin: origin);
      final jsonData = jsonDecode(response);
      final agoraToken = jsonData["sendAgoraTokenToUsers"];
      return agoraToken;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<bool?> getUserBlockStatus(String userId, String origin) async {
    try {
      final response = await api.call(
        document: ChatQueryMutation.getUserBlockStatus,
        variables: {"relationId": userId},
        origin: origin,
      );

      final jsonData = jsonDecode(response);

      return jsonData["isUserBlocked"];
    } catch (_) {
      return null;
    }
  }

  @override
  Future<String?> createFfChannel(ChannelDetailsModel channelDetails, String origin) async {
    try {
      final response = await api.call(
          document: ChatQueryMutation.createFfChannel,
          variables: {
            "createFfChannelInput": {
              "description": channelDetails.description,
              "id": channelDetails.id,
              "name": channelDetails.name,
              "imageUrl": channelDetails.imageUrl,
            },
          },
          origin: origin);

      return response;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<String?> updateFfChannel(ChannelDetailsModel channelDetails, String origin) async {
    try {
      final response = await api.call(
          document: ChatQueryMutation.updateFfChannel,
          variables: {
            "updateFfChannelInput": {
              "description": channelDetails.description,
              "id": channelDetails.id,
              "name": channelDetails.name,
              "imageUrl": channelDetails.imageUrl,
            },
          },
          origin: origin);

      return response;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<List<ChannelDetailsModel>?> searchChannel({required String searchTerm, required int startIndex, required int endIndex, required String origin}) async {
    try {
      final response = await api.call(
          document: ChatQueryMutation.searchChannel,
          variables: {
            "searchChannelInput": {
              "name": searchTerm,
              "startIndex": startIndex,
              "endIndex": endIndex,
            },
          },
          origin: origin);
      final responseData = jsonDecode(response);

      final allChannelMap = responseData["searchChannel"] as List;
      final channelList = allChannelMap.map((channel) => ChannelDetailsModel.fromJson(channel)).toList();
      return channelList;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<String?> followChannel(String channelId, String createdBy, String origin) async {
    try {
      final response = await api.call(
          document: ChatQueryMutation.followChannel,
          variables: {
            "followChannelInput": {
              "channelId": channelId,
              "createdBy": createdBy,
            },
          },
          origin: origin);

      if (response.isEmpty) return null;
      return response;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<String?> unFollowChannel(String channelId, String origin) async {
    try {
      final response = await api.call(
          document: ChatQueryMutation.unFollowChannel,
          variables: {
            "unFollowChannelInput": {
              "channelId": channelId,
            },
          },
          origin: origin);

      if (response.isEmpty) return null;
      return response;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<ChannelDetailsModel?> findOneChannel(String channelId, String origin) async {
    try {
      final response = await api.call(
          document: ChatQueryMutation.findOneChannel,
          variables: {
            "channelId": channelId,
          },
          origin: origin);

      final responseData = jsonDecode(response);
      final channelDetails = ChannelDetailsModel.fromJson(responseData["findOneChannel"]);
      return channelDetails;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<List<ChannelDetailsModel>?> suggestedChannel({required String origin, required int startIndex, required int endIndex}) async {
    try {
      final response = await api.call(
          document: ChatQueryMutation.suggestedChannel,
          variables: {
            "paginationIndexBase": {
              "startIndex": startIndex,
              "endIndex": endIndex,
            }
          },
          origin: origin);
      final responseData = jsonDecode(response);

      final allChannelMap = responseData["suggestedChannel"] as List;
      final channelList = allChannelMap.map((channel) => ChannelDetailsModel.fromJson(channel)).toList();
      return channelList;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<List<ChatUserSearchModel>?> searchFriend(String searchTerm, int startIndex, int endIndex, String origin) async {
    try {
      final response = await api.call(
          document: ChatQueryMutation.searchUsersFromFriendsForChat,
          variables: {
            "searchUserForChatInputDto": {
              "startIndex": startIndex,
              "endIndex": endIndex,
              "name": searchTerm,
            }
          },
          origin: origin);
      final responseData = jsonDecode(response);

      final allUsers = responseData["searchUsersFromFriendsForChat"] as List;
      final users = allUsers.map((user) => ChatUserSearchModel(searchUser: SearchUser.fromMap(user))).toList();

      return users;
    } catch (_) {
      return null;
    }
  }

  @override
  Future<List<ChatUserSearchModel>?> searchSuggestedUser(String searchTerm, int startIndex, int endIndex, String origin) async {
    try {
      final response = await api.call(
          document: ChatQueryMutation.searchUsersWithoutFriendsForChat,
          variables: {
            "searchUserForChatInputDto": {
              "startIndex": startIndex,
              "endIndex": endIndex,
              "name": searchTerm,
            }
          },
          origin: origin);
      final responseData = jsonDecode(response);

      final allUsers = responseData["searchUsersWithoutFriendsForChat"] as List;
      final users = allUsers.map((user) => ChatUserSearchModel(searchUser: SearchUser.fromMap(user))).toList();
      return users;
    } catch (_) {
      return null;
    }
  }
}
