//
//  CUTEPropertyInfoViewController.m
//  currant
//
//  Created by Foster Yin on 4/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyInfoViewController.h"
#import "CUTERentContactViewController.h"
#import "CUTERectContactForm.h"
#import "CUTEDataManager.h"
#import <Bolts/Bolts.h>
#import "CUTEAPIManager.h"
#import <Sequencer.h>
#import "CUTEProperty.h"
#import <UIKit/UIKit.h>

@implementation CUTEPropertyInfoViewController

- (void)submit
{
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    CUTEProperty *property = ticket.property;
    if (ticket && property) {
        Sequencer *sequencer = [Sequencer new];
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[self uploadImage] continueWithBlock:^id(BFTask *task) {
                property.realityImages = @[@"http://bbt-currant.s3.amazonaws.com/1ac690bbb2e4406a949c9ed5d37ed466"];
                completion(task.result);
                return nil;
            }];
        }];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[self addProperty] continueWithBlock:^id(BFTask *task) {
                completion(task.result);
                return nil;
            }];
        }];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            CUTERentContactViewController *contactViewController = [CUTERentContactViewController new];
            CUTERectContactForm *form = [CUTERectContactForm new];
            contactViewController.formController.form = form;
            [self.navigationController pushViewController:contactViewController animated:YES];
        }];

        [sequencer run];
    }
}

- (BFTask *)uploadImage {

    FXFormImagePickerCell *imagePickerCell = (FXFormImagePickerCell *)[[self.formController tableView] cellForRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0]];
    UIImage *image = [[imagePickerCell imageView] image];
    if (image) {
        NSData *dataImage = UIImageJPEGRepresentation(image, 1.0f);
        return [[CUTEAPIManager sharedInstance] POST:@"/api/1/upload_image" parameters:@{@"data": dataImage, @"thumbnail_size":@"320,213"} resultClass:nil];
    }
    return nil;
}

- (BFTask *)addProperty {
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    CUTEProperty *property = ticket.property;

    FXFormField *propertyTypeField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:0 inSection:1]];
    property.propertyType = propertyTypeField.value;
    FXFormField *bedroomCountField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:1 inSection:1]];
    property.bedroomCount = [bedroomCountField.value integerValue];
    //    FXFormField *spaceField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:2 inSection:1]];

    return [[CUTEAPIManager sharedInstance] POST:@"/api/1/property/none/edit" parameters:[property toParams] resultClass:[CUTEProperty class]];
}


@end
