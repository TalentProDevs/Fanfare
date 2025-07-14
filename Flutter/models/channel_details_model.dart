// ignore_for_file: public_member_api_docs, sort_constructors_first
import 'package:json_annotation/json_annotation.dart';

import 'datetime_serializer.dart';

part 'channel_details_model.g.dart';

@JsonSerializable(includeIfNull: false, explicitToJson: true)
class ChannelDetailsModel {
  final String id;
  final String? channelUrl;
  final String? name;
  final String? description;
  final String? imageUrl;
  final String? createdBy;
  final List<String>? adminUids;
  final String? lastMessage;
  final String? lastMessageType;
  final String? allowedReactionType;
  final int? followerCount;
  final bool? isLastMessageDeleted;
  @JsonKey(
    fromJson: dateTimeFromJson,
    toJson: dateTimeToJson,
  )
  final DateTime? createdAt;
  @JsonKey(
    fromJson: dateTimeFromJson,
    toJson: dateTimeToJson,
  )
  final DateTime? lastMessageTimestamp;

  ChannelDetailsModel({
    required this.id,
    this.name,
    this.createdAt,
    this.description,
    this.imageUrl,
    this.createdBy,
    this.adminUids,
    this.lastMessage,
    this.lastMessageType,
    this.lastMessageTimestamp,
    this.channelUrl,
    this.allowedReactionType,
    this.followerCount,
    this.isLastMessageDeleted,
  });

  factory ChannelDetailsModel.fromJson(Map<String, dynamic> json) => _$ChannelDetailsModelFromJson(json);

  Map<String, dynamic> toJson() => _$ChannelDetailsModelToJson(this);

  ChannelDetailsModel copyWith({
    String? id,
    String? channelUrl,
    String? name,
    String? description,
    String? imageUrl,
    String? createdBy,
    List<String>? adminUids,
    String? lastMessage,
    String? lastMessageType,
    DateTime? createdAt,
    DateTime? lastMessageTimestamp,
    String? allowedReactionType,
    int? followerCount,
    bool? isLastMessageDeleted,
  }) {
    return ChannelDetailsModel(
      id: id ?? this.id,
      channelUrl: channelUrl ?? this.channelUrl,
      name: name ?? this.name,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      createdBy: createdBy ?? this.createdBy,
      adminUids: adminUids ?? this.adminUids,
      lastMessage: lastMessage ?? this.lastMessage,
      lastMessageType: lastMessageType ?? this.lastMessageType,
      createdAt: createdAt ?? this.createdAt,
      lastMessageTimestamp: lastMessageTimestamp ?? this.lastMessageTimestamp,
      allowedReactionType: allowedReactionType ?? this.allowedReactionType,
      followerCount: followerCount ?? this.followerCount,
      isLastMessageDeleted: isLastMessageDeleted ?? this.isLastMessageDeleted,
    );
  }
}

class ChannelDetailsWitSeenStatus {
  final ChannelDetailsModel channelDetailsModel;
  final bool isMessageUnseen;

  ChannelDetailsWitSeenStatus({required this.channelDetailsModel, this.isMessageUnseen = false});

  ChannelDetailsWitSeenStatus copyWith({
    ChannelDetailsModel? channelDetailsModel,
    bool? isMessageUnseen,
  }) {
    return ChannelDetailsWitSeenStatus(
      channelDetailsModel: channelDetailsModel ?? this.channelDetailsModel,
      isMessageUnseen: isMessageUnseen ?? this.isMessageUnseen,
    );
  }
}
