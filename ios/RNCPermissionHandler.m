

#import <Foundation/Foundation.h>
#import <AVFoundation/AVCaptureDevice.h>
#import <Photos/Photos.h>
#import <React/RCTConvert.h>

#import "RNCPermissionHandler.h"


//MARK: - ENUMs
/*
 * 현재는 기본 요청 퍼미션이 PhotoLibrary로 되어 있음.
 * 향후 Camera / Audio / PhotoLibraryAdditions 추가 예정
 */
typedef NS_ENUM(NSInteger, RNCPermissionTypes){
  RNCPermissionPhotoLibrary = 0,
  RNCPermissionPhotoLibraryAdditions,
  RNCPermissionCamera,
  RNCPermissionAudio
};

typedef NS_ENUM(NSInteger, RNCPHPermissionIosStatus){
  RNCPHPermissionIosStatusNotDetermined = 0,
  RNCPHPermissionIosStatusRestricted,
  RNCPHPermissionIosStatusDenied,
  RNCPHPermissionIosStatusAuthorized,
  RNCPHPermissionIosStatusLimited,// API_AVAILABLE(ios(14)),
};

/*
 * 각 값에 해당하는 문자열은 PermissionIosStatics.ts 파일의 PERMISSION_IOS_STATUS와 동일한 문자열
 * 변경 시 두 파일의 값을 모두 변경하여 서로 다른 값이 되지 않도록 주의
 */
@implementation RCTConvert(PHPermissionIosStatus)
RCT_ENUM_CONVERTER(RNCPHPermissionIosStatus,
                   (@{
                    @"notDetermined":@(RNCPHPermissionIosStatusNotDetermined),
                    @"restricted":@(RNCPHPermissionIosStatusRestricted),
                    @"denied":@(RNCPHPermissionIosStatusDenied),
                    @"authorized":@(RNCPHPermissionIosStatusAuthorized),
                    @"limited":@(RNCPHPermissionIosStatusLimited),
                   }), RNCPHPermissionIosStatusNotDetermined, integerValue)

@end

//MARK: -IosPermissionHandler Module

@implementation RNCPermissionHandler

RCT_EXPORT_MODULE(IosPermissionHandler);

- (NSString *)stringForStatus:(RNCPHPermissionIosStatus)status {
  switch (status) {
    case RNCPHPermissionIosStatusNotDetermined:
      return @"notDetermined";
    case RNCPHPermissionIosStatusRestricted:
      return @"restricted";
    case RNCPHPermissionIosStatusDenied:
      return @"denied";
    case RNCPHPermissionIosStatusAuthorized:
      return @"authorized";
    case RNCPHPermissionIosStatusLimited:
      return @"limited";
  }
}

- (void)switchPHPermissionResolve:(PHAuthorizationStatus)status
                                  resolve:(RCTPromiseResolveBlock)resolve {
  switch (status) {
    case PHAuthorizationStatusAuthorized:
      resolve([self stringForStatus:RNCPHPermissionIosStatusAuthorized]);
      break;
      
    case PHAuthorizationStatusNotDetermined:
      resolve([self stringForStatus:RNCPHPermissionIosStatusNotDetermined]);
      break;
      
    case PHAuthorizationStatusDenied:
      resolve([self stringForStatus:RNCPHPermissionIosStatusDenied]);
      break;
      
    case PHAuthorizationStatusRestricted:
      resolve([self stringForStatus:RNCPHPermissionIosStatusRestricted]);
      break;
      
    case PHAuthorizationStatusLimited:
      resolve([self stringForStatus:RNCPHPermissionIosStatusLimited]);
    break;
  }
}

RCT_EXPORT_METHOD(openSetting){
  //UI는 main queue에서만 업데이트 가능
  dispatch_async(dispatch_get_main_queue(), ^{
  [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]
                                     options: @{}
                                     completionHandler: nil];
  });
}


RCT_EXPORT_METHOD(requestPermission:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject){
   if(@available(ios 14, *)){
     [PHPhotoLibrary requestAuthorizationForAccessLevel:PHAccessLevelReadWrite
                                                handler:^(PHAuthorizationStatus status) {
       [self switchPHPermissionResolve:status resolve:resolve];
     }];
  } else {
        [PHPhotoLibrary requestAuthorization:^(PHAuthorizationStatus status) {
          [self switchPHPermissionResolve:status resolve:resolve];
        }];
  }
}

RCT_EXPORT_METHOD(checkPermission:
                  (RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject){
  PHAuthorizationStatus status;
  if( @available(ios 14, *)){
    status = [PHPhotoLibrary authorizationStatusForAccessLevel:PHAccessLevelReadWrite];
  } else {
    status = [PHPhotoLibrary authorizationStatus];
  }
  [self switchPHPermissionResolve:status resolve:resolve];
}


RCT_EXPORT_METHOD(checkCameraPermission){
  AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];
  
  switch (status){
    case AVAuthorizationStatusAuthorized:
      // 동의함
      NSLog(@"Authorized");
    
      break;
      
    case AVAuthorizationStatusNotDetermined:
      NSLog(@"Not determined");
      // 정의 안됨 (동의전)
      //      [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:^(BOOL granted) {
      //        if (granted) {
      //          //Granted access to mediaType
      //          dispatch_async (dispatch_get_main_queue (), ^{
      //          });
      //        }
      //      }];
    
      break;
      
    case AVAuthorizationStatusDenied:
      NSLog(@"denied");
      // 동의안함
      //      UIAlertController * alert=   [UIAlertController
      //                                    alertControllerWithTitle:@"카메라 접근 요청"
      //                                    message:@"카메라 접근 권한이 허용되지 않았습니다.\n'확인' 버튼을 누르시면 접근권한 설정 화면으로 이동합니다."
      //                                    preferredStyle:UIAlertControllerStyleAlert];
      //      UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"확인" style:UIAlertActionStyleDefault handler:^(UIAlertAction *action)
      //                                 {
      //        [[UIApplication sharedApplication] openURL:[NSURL URLWithString:UIApplicationOpenSettingsURLString]
      //                                           options:@{}
      //                                 completionHandler:nil];
      //      }];
      //
      //      UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"취소" style:UIAlertActionStyleDefault handler:nil];
      //      [alert addAction:okAction];
      //      [alert addAction:cancelAction];
      //
      //      UIViewController *rootView = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
      //      while (rootView.presentedViewController) {
      //        rootView = rootView.presentedViewController;
      //      }
      //      [rootView presentViewController:alert animated:YES completion:nil];
      //
      break;
      
    case AVAuthorizationStatusRestricted:
      NSLog(@"restricted");
      break;
    }
  }


@end
