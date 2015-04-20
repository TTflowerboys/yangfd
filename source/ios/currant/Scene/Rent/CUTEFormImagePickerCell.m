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
#import <NSArray+Frankenstein.h>
#import "CUTEFormImagePickerPlaceholderView.h"
#import "MasonryMake.h"
#import <UIView+BBT.h>
#import "CUTEDataManager.h"
#import "SVProgressHUD+CUTEAPI.h"

@interface CUTEFormImagePickerCell () <CTAssetsPickerControllerDelegate, UIActionSheetDelegate,  UINavigationControllerDelegate, UIImagePickerControllerDelegate>
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

- (NSArray *)images {
    return (NSArray *)self.field.value;
}

- (void)setImages:(NSArray *)images {
    self.field.value = images;
}

- (void)addImage:(ALAsset *)image {
    if ([self images] == nil) {
        [self setImages:@[]];
    }
    [self setImages:[[self images] arrayByAddingObject:image]];
}

- (void)updateImages:(NSArray *)images {
    [self setImages:images];
    [[[[CUTEDataManager sharedInstance] currentRentTicket] property] setRealityImages:[self images]];
    [self update];
}

- (void)update
{
    BOOL hidePlaceHolder = !IsArrayNilOrEmpty([self images]);
    [_placeholderView setHidden:hidePlaceHolder];
    [_scrollView setHidden:!hidePlaceHolder];
    [_addButton setHidden:!hidePlaceHolder];

    [self updateThumbnails:[self images]];
    [self setNeedsLayout];
}

- (void)updateThumbnails:(NSArray *)assets {
    [_scrollView removeAllSubViews];

    if (!IsArrayNilOrEmpty(assets)) {
        CGFloat sideWidth = RectHeight(_scrollView.bounds);
        CGFloat margin = 10;
        [assets enumerateObjectsUsingBlock:^(ALAsset *obj, NSUInteger idx, BOOL *stop) {
            UIImage *image = [UIImage imageWithCGImage:obj.thumbnail];
            UIImageView *imageView = [[UIImageView alloc] initWithImage:image];
            [_scrollView addSubview:imageView];
            imageView.frame = CGRectMake(sideWidth * idx + margin * (idx + 1), 0, sideWidth, sideWidth);
        }];
        _scrollView.contentSize = CGSizeMake((sideWidth + margin) * [assets count], sideWidth);
        [_scrollView scrollRectToVisible:[(UIView *)[[_scrollView subviews] lastObject] frame] animated:NO];
    }
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

- (void)showImagePickerFrom:(UIViewController *)controller {
    [self assetsPickerController].selectedAssets = [NSMutableArray arrayWithArray:[self images]];
    [controller presentViewController:[self assetsPickerController] animated:YES completion:^  {

    }];
}

- (void)showCameraFrom:(UIViewController *)controller {
    UIImagePickerController *picker = [[UIImagePickerController alloc] init];
    if ([UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera]) {
        picker.sourceType = UIImagePickerControllerSourceTypeCamera;
        picker.delegate = self;
        [controller presentViewController:picker animated:YES completion:^{

        }];
    }
}

- (void)showActionSheet {
    UIActionSheet *actionSheet = [[UIActionSheet alloc] initWithTitle:STR(@"选择照片") delegate:self cancelButtonTitle:STR(@"取消") destructiveButtonTitle:nil otherButtonTitles:STR(@"从手机选择"), STR(@"拍照"), nil];
    [actionSheet showInView:[self tableViewController].view];
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

#pragma mark - UIActionSheetDelegate 

- (void)actionSheet:(UIActionSheet *)actionSheet clickedButtonAtIndex:(NSInteger)buttonIndex {
    if (buttonIndex == 0) {
        [self showImagePickerFrom:[self tableViewController]];
    }
    else if (buttonIndex == 1) {
        [self showCameraFrom:[self tableViewController]];
    }

}

#pragma mark - Assets Picker Delegate

- (BOOL)assetsPickerController:(CTAssetsPickerController *)picker isDefaultAssetsGroup:(ALAssetsGroup *)group
{
    return ([[group valueForProperty:ALAssetsGroupPropertyType] integerValue] == ALAssetsGroupSavedPhotos);
}

- (void)assetsPickerController:(CTAssetsPickerController *)picker didFinishPickingAssets:(NSArray *)assets
{
    [picker.presentingViewController dismissViewControllerAnimated:YES completion:nil];
    [self setImages:assets];
    [[[[CUTEDataManager sharedInstance] currentRentTicket] property] setRealityImages:[self images]];
    [self update];
}

- (BOOL)assetsPickerController:(CTAssetsPickerController *)picker shouldEnableAsset:(ALAsset *)asset
{
    // Enable video clips if they are at least 5s
    if ([[asset valueForProperty:ALAssetPropertyType] isEqual:ALAssetTypeVideo])
    {
        NSTimeInterval duration = [[asset valueForProperty:ALAssetPropertyDuration] doubleValue];
        return lround(duration) >= 5;
    }
    else
    {
        return YES;
    }
}

//TODO need image count limit?

- (BOOL)assetsPickerController:(CTAssetsPickerController *)picker shouldSelectAsset:(ALAsset *)asset
{
    if (picker.selectedAssets.count >= 10)
    {
        UIAlertView *alertView =
        [[UIAlertView alloc] initWithTitle:@"Attention"
                                   message:@"Please select not more than 10 assets"
                                  delegate:nil
                         cancelButtonTitle:nil
                         otherButtonTitles:@"OK", nil];

        [alertView show];
    }

    if (!asset.defaultRepresentation)
    {
        UIAlertView *alertView =
        [[UIAlertView alloc] initWithTitle:@"Attention"
                                   message:@"Your asset has not yet been downloaded to your device"
                                  delegate:nil
                         cancelButtonTitle:nil
                         otherButtonTitles:@"OK", nil];

        [alertView show];
    }

    return (picker.selectedAssets.count < 10 && asset.defaultRepresentation != nil);
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

    [SVProgressHUD show];
    ALAssetsLibrary *library = [self assetsPickerController].assetsLibrary;
    [library writeImageToSavedPhotosAlbum:[image CGImage] orientation:(ALAssetOrientation)[image imageOrientation] completionBlock:^(NSURL *assetURL, NSError *error){
        if (error) {
            [SVProgressHUD showErrorWithError:error];
        } else {
            [library assetForURL:assetURL resultBlock:^(ALAsset *asset) {
                [self addImage:asset];
                [[[[CUTEDataManager sharedInstance] currentRentTicket] property] setRealityImages:[self images]];
                [self update];
                [SVProgressHUD dismiss];
                [picker dismissViewControllerAnimated:YES completion:NULL];
            } failureBlock:^(NSError *error) {
                [SVProgressHUD showErrorWithError:error];
            }];
        }
    }];
}

@end
