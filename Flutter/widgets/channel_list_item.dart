import 'package:flutter/material.dart';

import '../../../../Utilities/button/gradient_button.dart';
import '../../../../Utilities/circular_cached_network_image.dart';
import '../../../../Utilities/color/colors_file.dart';
import '../../../../Utilities/textStyle/app_text_style.dart';
import '../../../../Utilities/textStyle/app_text_style_limit.dart';
import '../../../../global/global_image_scaling.dart';

class ChannelListItem extends StatelessWidget {
  const ChannelListItem({
    this.valueKey,
    this.title,
    this.subtitle,
    this.trailingText,
    this.imageUrl,
    this.onTap,
    this.trailingButtonTap,
    this.trailingButtonText,
    this.isBoldSubtitle = false,
  });

  final ValueKey? valueKey;
  final String? title;
  final String? subtitle;
  final String? trailingText;
  final String? trailingButtonText;
  final String? imageUrl;
  final VoidCallback? onTap;
  final VoidCallback? trailingButtonTap;
  final bool isBoldSubtitle;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      key: valueKey,
      leading: CircularCachedNetworkImage(
        imageUrl: imageUrl ?? "",
        imageRadius: 25,
        memCacheHeight: 120,
        placeHolderType: ImagePlaceHolderType.channel,
      ),
      title: Row(
        children: [
          Expanded(
            child: AppTextStyle(
              title ?? "",
              14,
              FontWeight.bold,
              Colors.black,
              false,
              null,
              TextOverflow.ellipsis,
              1,
            ),
          ),
          if (trailingButtonText != null)
            RaisedGradientButton(
              width: 80,
              height: 30,
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomLeft,
                colors: <Color>[GetColorsData.primaryColor2, GetColorsData.primaryColor],
              ),
              onPressed: trailingButtonTap,
              child: AppTextStyle(trailingButtonText ?? "", 12, FontWeight.w700, Colors.white),
            )
        ],
      ),
      subtitle: subtitle != null
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3.0),
                    child: AppTextSyleOverFlow(
                      subtitle ?? "",
                      13,
                      isBoldSubtitle ? FontWeight.bold : FontWeight.w400,
                      isBoldSubtitle ? Colors.black : Colors.grey,
                    ),
                  ),
                ),
                if (trailingText != null)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 5.0),
                    child: AppTextStyle(
                      trailingText ?? "",
                      12,
                      isBoldSubtitle ? FontWeight.bold : FontWeight.w400,
                      isBoldSubtitle ? Colors.black : Colors.grey,
                    ),
                  ),
              ],
            )
          : null,
      onTap: onTap,
    );
  }
}
