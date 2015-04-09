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
#import <BBTRestClient.h>
#import "CUTEConfiguration.h"
#import <BBTJSON.h>
#import <NSArray+Frankenstein.h>

@interface CUTEPropertyInfoViewController () {
    BBTRestClient *_imageUploader;
}

@end


@implementation CUTEPropertyInfoViewController

- (void)submit
{
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    CUTEProperty *property = ticket.property;
    if (ticket && property) {
        Sequencer *sequencer = [Sequencer new];
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[self uploadImages] continueWithBlock:^id(BFTask *task) {
                property.realityImages = task.result;
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

- (BFTask *)updateImage:(UIImage*)image {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    if (image) {
        NSData *dataImage = UIImageJPEGRepresentation(image, 1.0f);

        if (!_imageUploader) {
            _imageUploader = [BBTRestClient clientWithBaseURL:[NSURL URLWithString:[CUTEConfiguration apiEndpoint]] account:nil];
        }
        [_imageUploader POST:@"/api/1/upload_image" parameters:@{@"thumbnail_size":@"320,213"} constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
            //do not put image inside parameters dictionary as I did, but append it!
            [formData appendPartWithFileData:dataImage name:@"data" fileName:@"filename.jpg" mimeType:@"image/jpeg"];
        }  success:^(AFHTTPRequestOperation *operation, id responseObject) {
            NSDictionary *responseDic = (NSDictionary *)responseObject;
            if ([[responseDic objectForKey:@"ret"] integerValue] == 0) {
                NSString *url = responseDic[@"val"][@"url"];
                [tcs setResult:url];
            }
            else {
                [tcs setError:[NSError errorWithDomain:responseDic[@"msg"] code:[[responseDic objectForKey:@"ret"] integerValue] userInfo:responseDic]];
            }
        } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
            [tcs setError:error];
        }];
    }
    else {
        [tcs setResult:nil];
    }
    return tcs.task;

}

- (BFTask *)uploadImages {
    FXFormImagePickerCell *imagePickerCell = (FXFormImagePickerCell *)[[self.formController tableView] cellForRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0]];
    UIImage *image = [[imagePickerCell imageView] image];
    NSArray *images = @[image];
    return [BFTask taskForCompletionOfAllTasksWithResults:[images map:^id(UIImage *object) {
        return [self updateImage:object];
    }]];

}

- (BFTask *)addProperty {
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    CUTEProperty *property = ticket.property;
    FXFormField *propertyTypeField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:0 inSection:1]];
    property.propertyType = propertyTypeField.value;
    FXFormField *bedroomCountField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:1 inSection:1]];
    property.bedroomCount = [bedroomCountField.value integerValue];
    BFTask *task = [[CUTEAPIManager sharedInstance] POST:@"/api/1/property/none/edit" parameters:[property toParams] resultClass:[CUTEProperty class]];
    return task;
}


@end
