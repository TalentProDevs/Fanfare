import 'package:get/get.dart';

import '../controller/all_channel_controller.dart';

class AllChannelBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AllChannelController>(
      () => AllChannelController(),
    );
  }
}
