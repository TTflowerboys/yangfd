//
//  CUTEFormImagePickerCell.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEFormImagePickerCell.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import <CTAssetsPickerController.h>
#import <CTAssetsGroupViewController.h>
#import <NSArray+ObjectiveSugar.h>
#import "CUTEFormImagePickerPlaceholderView.h"
#import "MasonryMake.h"
#import <UIView+BBT.h>
#import "CUTEDataManager.h"
#import "SVProgressHUD+CUTEAPI.h"
#import <UIActionSheet+Blocks.h>
#import <NSObject+Attachment.h>
#import <MWPhotoBrowser.h>
#import <Bolts.h>
#import <AVFoundation/AVFoundation.h>
#import "CUTERentTickePublisher.h"
#import "CUTEImageUploader.h"
#import <Sequencer/Sequencer.h>
#import <UIImageView+AFNetworking.h>
#import "UIImageView+Assets.h"
#import "NSURL+Assets.h"
#import <UIAlertView+Blocks.h>

@interface CUTEFormImagePickerCell () <CTAssetsPickerControllerDelegate,  UINavigationControllerDelegate, UIImagePickerControllerDelegate, MWPhotoBrowserDelegate>
{
    CUTEFormImagePickerPlaceholderView *_placeholderView;

    UIScrollView *_scrollView;

    UIButton *_addButton;

    CTAssetsPickerController *_assetsPickerController;
}
@end

@implementation CUTEFormImagePickerCell

+ (CGFloat)heightForField:(FXFormField *)field width:(CGFloat)width
{
    return 112;
}


- (void)setUp {
    [super setUp];
    _placeholderView = [CUTEFormImagePickerPlaceholderView new];
    [self.contentView addSubview:_placeholderView];
    _scrollView = [UIScrollView new];
    [self.contentView addSubview:_scrollView];
    _addButton = [UIButton buttonWithType:UIButtonTypeCustom];
    [_addButton setImage:IMAGE(@"button-add-image") forState:UIControlStateNormal];
    [self.contentView addSubview:_addButton];
    [_addButton addTarget:self action:@selector(onAddButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    [_scrollView setHidden:YES];
    [_addButton setHidden:YES];

    MakeBegin(_placeholderView)
    MakeTopEqualTo(self.contentView.top).offset(20);
    MakeCenterXEqualTo(self.contentView);
    MakeEnd

    MakeBegin(_scrollView)
    MakeTopEqualTo(self.contentView.top).offset(16);
    MakeBottomEqualTo(self.contentView.bottom).offset(-16);
    MakeLeftEqualTo(self.contentView.left);
    MakeRighEqualTo(self.contentView.right).offset(-98);
    MakeEnd

    MakeBegin(_addButton)
    MakeTopEqualTo(_scrollView.top);
    MakeBottomEqualTo(_scrollView.bottom);
    MakeRighEqualTo(self.contentView.right).offset(-8);
    MakeEnd



}

- (void)updateImages:(NSArray *)images {
    self.ticket.property.realityImages = [NSMutableArray arrayWithArray:IsArrayNilOrEmpty(images)? @[]: images];
}

- (void)addImage:(NSString *)imageURLStr {
    if (IsArrayNilOrEmpty(self.ticket.property.realityImages)) {
        self.ticket.property.realityImages = [NSMutableArray arrayWithObject:imageURLStr];
    }
    else
    {
        self.ticket.property.realityImages = [NSMutableArray arrayWithArray:[self.ticket.property.realityImages arrayByAddingObject:imageURLStr]];
    }
}

- (void)update
{
    BOOL hidePlaceHolder = !IsArrayNilOrEmpty([self ticket].property.realityImages);
    [_placeholderView setHidden:hidePlaceHolder];
    [_scrollView setHidden:!hidePlaceHolder];
    [_addButton setHidden:!hidePlaceHolder];

    [self updateThumbnails:[self ticket].property.realityImages];

    [self setNeedsLayout];
}

- (void)updateThumbnails:(NSArray *)items {
    [_scrollView removeAllSubViews];

    if (!IsArrayNilOrEmpty(items)) {
        CGFloat sideWidth = RectHeight(_scrollView.bounds);
        CGFloat margin = 10;
        [items eachWithIndex:^(id obj, NSUInteger idx) {
            UIImageView *imageView = [[UIImageView alloc] init];
            [imageView setImageWithAssetURL:[NSURL URLWithString:obj] thumbnail:YES failureBlock:^(NSError *error) {
                [SVProgressHUD showErrorWithError:error];
            }];
            [imageView addGestureRecognizer:[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onImageTapped:)]];
            imageView.userInteractionEnabled = YES;
            imageView.attachment = [NSNumber numberWithInteger:idx];
            [_scrollView addSubview:imageView];
            imageView.frame = CGRectMake(sideWidth * idx + margin * (idx + 1), 0, sideWidth, sideWidth);
        }];
        _scrollView.contentSize = CGSizeMake((sideWidth + margin) * [items count], sideWidth);
        [_scrollView scrollRectToVisible:[(UIView *)[[_scrollView subviews] lastObject] frame] animated:NO];
    }
}

- (void)onImageTapped:(UITapGestureRecognizer *)tapGesture {
    NSNumber *index = tapGesture.view.attachment;
    MWPhotoBrowser *browser = [[MWPhotoBrowser alloc] initWithDelegate:self];
    browser.displayActionButton = NO;
    browser.displaySelectionButtons = YES;
    browser.alwaysShowControls = NO;
    [browser setCurrentPhotoIndex:index.integerValue];
    UINavigationController *nc = [[UINavigationController alloc] initWithRootViewController:browser];
    nc.modalTransitionStyle = UIModalTransitionStyleCrossDissolve;
    [[self tableViewController] presentViewController:nc animated:YES completion:nil];
}

- (UIViewController *)tableViewController
{
    id responder = self.superview;
    while (responder)
    {
        if ([responder isKindOfClass:[UIViewController class]])
        {
            return responder;
        }
        responder = [responder nextResponder];
    }
    return nil;
}

- (CTAssetsPickerController *)assetsPickerController {
    if (!_assetsPickerController) {
        CTAssetsPickerController *picker = [[CTAssetsPickerController alloc] init];
        picker.assetsFilter = [ALAssetsFilter allPhotos];
        picker.showsCancelButton = (UI_USER_INTERFACE_IDIOM() != UIUserInterfaceIdiomPad);
        picker.delegate = self;
        picker.alwaysEnableDoneButton = YES;
        _assetsPickerController = picker;
    }
    return _assetsPickerController;
}

- (BFTask *)getAssetsLibraryAuthorizationStatus {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    if ([ALAssetsLibrary authorizationStatus] == ALAuthorizationStatusAuthorized) {
        [tcs setResult:@(ALAuthorizationStatusAuthorized)];
    }
    else if ([ALAssetsLibrary authorizationStatus] == ALAuthorizationStatusDenied) {
        [tcs setError:[NSError errorWithDomain:ALAssetsLibraryErrorDomain code:ALAssetsLibraryAccessUserDeniedError userInfo:@{NSLocalizedDescriptionKey: STR(@"此应用程序对您的照片没有访问权，您可以在隐私设置中启用访问权。") }]];
    }
    else if ([ALAssetsLibrary authorizationStatus] == ALAuthorizationStatusRestricted) {
        [tcs setError:[NSError errorWithDomain:ALAssetsLibraryErrorDomain code:ALAssetsLibraryAccessUserDeniedError userInfo:@{NSLocalizedDescriptionKey: STR(@"此应用程序对您的照片没有访问权，您可以在隐私设置中启用访问权。") }]];
    }
    else if ([ALAssetsLibrary authorizationStatus] == ALAuthorizationStatusNotDetermined) {
        [[self assetsPickerController].assetsLibrary enumerateGroupsWithTypes:ALAssetsGroupSavedPhotos usingBlock:^(ALAssetsGroup *group, BOOL *stop) {
            //enumerate will call multiple times
            if (!tcs.task.isCompleted) {
                [tcs setResult:@(ALAuthorizationStatusAuthorized)];
            }
        } failureBlock:^(NSError *error) {
            if (error.code == ALAssetsLibraryAccessUserDeniedError) {
                [tcs setError:[NSError errorWithDomain:ALAssetsLibraryErrorDomain code:ALAssetsLibraryAccessUserDeniedError userInfo:@{NSLocalizedDescriptionKey: STR(@"此应用程序对您的照片没有访问权，您可以在隐私设置中启用访问权。") }]];
            }else{
                [tcs setError:error];
            }
        }];
    }

    return [tcs task];
}

- (BFTask *)getCameraAuthorizationStatus {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];

    if(status == AVAuthorizationStatusAuthorized) { // authorized
        [tcs setResult:@(AVAuthorizationStatusAuthorized)];
    }
    else if(status == AVAuthorizationStatusDenied){ // denied
        [tcs setError:[NSError errorWithDomain:AVFoundationErrorDomain code:AVErrorApplicationIsNotAuthorized userInfo:@{NSLocalizedDescriptionKey: STR(@"此应用程序对您的相机没有访问权，您可以在隐私设置中启用访问权。")}]];
    }
    else if(status == AVAuthorizationStatusRestricted){ // restricted
        [tcs setError:[NSError errorWithDomain:AVFoundationErrorDomain code:AVErrorApplicationIsNotAuthorized userInfo:@{NSLocalizedDescriptionKey: STR(@"此应用程序对您的相机没有访问权，您可以在隐私设置中启用访问权。")}]];
    }
    else if(status == AVAuthorizationStatusNotDetermined){ // not determined

        [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:^(BOOL granted) {
            if(granted){ // Access has been granted ..do something
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    [tcs setResult:@(AVAuthorizationStatusAuthorized)];
                });
            } else { // Access denied ..do something
                dispatch_async(dispatch_get_main_queue(), ^(void) {
                    [tcs setError:[NSError errorWithDomain:AVFoundationErrorDomain code:AVErrorApplicationIsNotAuthorized userInfo:@{NSLocalizedDescriptionKey: STR(@"此应用程序对您的相机没有访问权，您可以在隐私设置中启用访问权。")}]];
                });
            }
        }];
    }

    return [tcs task];

}

- (void)showImagePickerFrom:(UIViewController *)controller {

    [[self getAssetsLibraryAuthorizationStatus] continueWithBlock:^id(BFTask *task) {
        if (task.error) {
            if ([[task.error domain] isEqualToString:ALAssetsLibraryErrorDomain] && task.error.code == ALAssetsLibraryAccessUserDeniedError) {
                [UIAlertView showWithTitle:task.error.userInfo[NSLocalizedDescriptionKey] message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
                }];
            }
            else {
                [SVProgressHUD showErrorWithError:task.error];
            }
        }
        else if (task.exception) {
            [SVProgressHUD showErrorWithException:task.exception];
        }
        else if (task.isCancelled) {
            [SVProgressHUD showErrorWithCancellation];
        }
        else {
            [[[CUTEImageUploader sharedInstance] getAssetsFromURLArray:self.ticket.property.realityImages] continueWithBlock:^id(BFTask *task) {
                [self assetsPickerController].selectedAssets = IsArrayNilOrEmpty(task.result)? [NSMutableArray array]: [NSMutableArray arrayWithArray:task.result];
                [controller presentViewController:[self assetsPickerController] animated:YES completion:^ {
                }];
                return nil;
            }];

        }
        return task;
    }];
}

//http://stackoverflow.com/questions/25803217/presenting-camera-permission-dialog-in-ios-8
- (void)showCameraFrom:(UIViewController *)controller {
    Sequencer *sequencer = [Sequencer new];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {

        [[self getAssetsLibraryAuthorizationStatus] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                if ([[task.error domain] isEqualToString:ALAssetsLibraryErrorDomain] && task.error.code == ALAssetsLibraryAccessUserDeniedError) {
                    [UIAlertView showWithTitle:task.error.userInfo[NSLocalizedDescriptionKey] message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
                    }];
                }
                else {
                    [SVProgressHUD showErrorWithError:task.error];
                }
            }
            else if (task.exception) {
                [SVProgressHUD showErrorWithException:task.exception];
            }
            else if (task.isCancelled) {
                [SVProgressHUD showErrorWithCancellation];
            }
            else {
                completion(task.result);
            }
            return task;
        }];

    }];

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [[self getCameraAuthorizationStatus] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [UIAlertView showWithTitle:task.error.userInfo[NSLocalizedDescriptionKey] message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
                }];
            }
            else if (task.exception) {
                [SVProgressHUD showErrorWithException:task.exception];
            }
            else if (task.isCancelled) {
                [SVProgressHUD showErrorWithCancellation];
            }
            else {
                UIImagePickerController *picker = [[UIImagePickerController alloc] init];
                if ([UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera]) {
                    picker.sourceType = UIImagePickerControllerSourceTypeCamera;
                    picker.delegate = self;
                    [controller presentViewController:picker animated:YES completion:^{

                    }];
                }
            }

            return task;
        }];
    }];

    [sequencer run];

}

- (void)showActionSheet {
    [UIActionSheet showInView:[self tableViewController].view withTitle:STR(@"选择照片") cancelButtonTitle:STR(@"取消") destructiveButtonTitle:nil otherButtonTitles:@[STR(@"从手机选择"), STR(@"拍照")] tapBlock:^(UIActionSheet *actionSheet, NSInteger buttonIndex) {

        if (buttonIndex == 0) {
            [self showImagePickerFrom:[self tableViewController]];
        }
        else if (buttonIndex == 1) {
            [self showCameraFrom:[self tableViewController]];
        }
    }];
}

- (void)onAddButtonPressed:(id)sender {
    [self showActionSheet];
}

- (void)didSelectWithTableView:(UITableView *)tableView controller:(UIViewController *)controller
{
    [tableView deselectRowAtIndexPath:tableView.indexPathForSelectedRow animated:YES];
    if (!_placeholderView.isHidden) {
        [self showActionSheet];
    }
}

#pragma mark - Assets Picker Delegate

- (BOOL)assetsPickerController:(CTAssetsPickerController *)picker isDefaultAssetsGroup:(ALAssetsGroup *)group
{
    return ([[group valueForProperty:ALAssetsGroupPropertyType] integerValue] == ALAssetsGroupSavedPhotos);
}

- (void)assetsPickerController:(CTAssetsPickerController *)picker didFinishPickingAssets:(NSArray *)assets
{
    //TODO check why read image from 我的照片流 而不是相机胶卷就失败
    [self updateImages:[assets map:^id(ALAsset *object) {
        return [[object valueForProperty:ALAssetPropertyAssetURL] absoluteString];
    }]];
    [self update];
    [picker.presentingViewController dismissViewControllerAnimated:YES completion:nil];

    [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:self.ticket];
    [[[CUTERentTickePublisher sharedInstance] editTicket:self.ticket updateStatus:nil] continueWithBlock:^id(BFTask *task) {
        if (task.error || task.exception || task.isCancelled) {
            [SVProgressHUD showErrorWithError:task.error];
        }
        else {
            [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:self.ticket];
        }
        return nil;
    }];
}

//TODO need image count limit?

//- (BOOL)assetsPickerController:(CTAssetsPickerController *)picker shouldSelectAsset:(ALAsset *)asset
//{
//    if (picker.selectedAssets.count >= 10)
//    {
//        UIAlertView *alertView =
//        [[UIAlertView alloc] initWithTitle:@"Attention"
//                                   message:@"Please select not more than 10 assets"
//                                  delegate:nil
//                         cancelButtonTitle:nil
//                         otherButtonTitles:@"OK", nil];
//
//        [alertView show];
//    }
//
//    if (!asset.defaultRepresentation)
//    {
//        UIAlertView *alertView =
//        [[UIAlertView alloc] initWithTitle:@"Attention"
//                                   message:@"Your asset has not yet been downloaded to your device"
//                                  delegate:nil
//                         cancelButtonTitle:nil
//                         otherButtonTitles:@"OK", nil];
//
//        [alertView show];
//    }
//
//    return (picker.selectedAssets.count < 10 && asset.defaultRepresentation != nil);
//}

#pragma mark - MWPhotoBrowserDelegate


- (NSUInteger)numberOfPhotosInPhotoBrowser:(MWPhotoBrowser *)photoBrowser
{
    return [[[self ticket] property] realityImages].count;
}

- (id <MWPhoto>)photoBrowser:(MWPhotoBrowser *)photoBrowser photoAtIndex:(NSUInteger)index
{
    NSString *asset = [[self ticket].property.realityImages objectAtIndex:index];
    return [MWPhoto photoWithURL:[NSURL URLWithString:asset]];
}


- (BOOL)photoBrowser:(MWPhotoBrowser *)photoBrowser isPhotoSelectedAtIndex:(NSUInteger)index
{
    NSString *asset = [[self ticket].property.realityImages objectAtIndex:index];
    if (!asset.attachment) {
        return YES;
    }
    else {
        return [[asset attachment] boolValue];
    }
}

- (void)photoBrowser:(MWPhotoBrowser *)photoBrowser photoAtIndex:(NSUInteger)index selectedChanged:(BOOL)selected {
    NSString *asset = [[self ticket].property.realityImages objectAtIndex:index];
    asset.attachment = [NSNumber numberWithBool:selected];
}

- (void)photoBrowserDidFinishModalPresentation:(MWPhotoBrowser *)photoBrowser {

    NSArray *editedAssets = [[self ticket].property.realityImages select:^BOOL(NSString *asset) {
        return asset.attachment == nil || [asset.attachment boolValue];
    }];
    [self updateImages:editedAssets];
    [self update];
    [[self tableViewController] dismissViewControllerAnimated:YES completion:nil];
}


#pragma mark - UIImagePickerControllerDelegate
- (void)imagePickerController:(UIImagePickerController *)picker
didFinishPickingMediaWithInfo:(NSDictionary *)info
{
    UIImage *image = [info objectForKey:UIImagePickerControllerEditedImage];
    if (image == nil)
    {
        image = [info objectForKey:UIImagePickerControllerOriginalImage];
    }

    [SVProgressHUD showWithStatus:STR(@"保存到本地...")];
    ALAssetsLibrary *library = [self assetsPickerController].assetsLibrary;
    [library writeImageToSavedPhotosAlbum:[image CGImage] orientation:(ALAssetOrientation)[image imageOrientation] completionBlock:^(NSURL *assetURL, NSError *error){
        if (error) {
            [SVProgressHUD showErrorWithError:error];
        } else {
            [self addImage:[assetURL absoluteString]];
            [self update];
            [picker dismissViewControllerAnimated:YES completion:NULL];
            [SVProgressHUD dismiss];

            [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:self.ticket];
            [[[CUTERentTickePublisher sharedInstance] editTicket:self.ticket updateStatus:nil]  continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else {
                    [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:self.ticket];
                }
                return nil;
            }];
        }
    }];
}

@end
