//
//  CUTEPropertyInfoViewController.m
//  currant
//
//  Created by Foster Yin on 4/8/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyInfoViewController.h"
#import "CUTERentContactViewController.h"
#import "CUTERentContactForm.h"
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
#import "CUTEEnumManager.h"
#import "CUTECommonMacro.h"
#import "CUTERentPriceViewController.h"
#import "CUTERentPriceForm.h"
#import "CUTEAreaForm.h"
#import "CUTEPropertyInfoForm.h"
#import <AssetsLibrary/AssetsLibrary.h>
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEFormImagePickerCell.h"
#import "CUTEPropertyMoreInfoViewController.h"


@interface CUTEPropertyInfoViewController () {
    BBTRestClient *_imageUploader;

    FXFormViewController *_editAreaViewController;

    CUTERentPriceViewController *_editRentPriceViewController;
}

@end


@implementation CUTEPropertyInfoViewController

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[CUTEFormImagePickerCell class]]) {
        CUTEFormImagePickerCell *pickerCell = (CUTEFormImagePickerCell *)cell;
        //TODO in the future the pickerCell can support show image from url
        NSArray *images = [[[[[CUTEDataManager sharedInstance] currentRentTicket] property] realityImages] collect:^BOOL(id object) {
            return [object isKindOfClass:[ALAsset class]];
        }];
        [pickerCell setImages:images];
        [pickerCell update];
    }
}

- (void)editArea {
  if (!_editAreaViewController) {
    CUTEProperty *property = [[[CUTEDataManager sharedInstance] currentRentTicket] property];
    FXFormViewController *controller = [FXFormViewController new];
    CUTEAreaForm *form = [CUTEAreaForm new];
    form.area = property.space.value;
    controller.formController.form = form;
    controller.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:self action:@selector(onSaveAreaButtonPressed:)];
    controller.navigationItem.title = STR(@"面积");
    _editAreaViewController = controller;

  }
  [self.navigationController pushViewController:_editAreaViewController animated:YES];
}

- (void)onSaveAreaButtonPressed:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    CUTEAreaForm *form = (CUTEAreaForm *)_editAreaViewController.formController.form;
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    ticket.space = [CUTEArea areaWithValue:form.area unit:form.unit];
    ticket.property.space = ticket.space;
}

- (void)editRentPrice {
    NSArray *requiredEnums = @[@"deposit_type", @"rent_period"];
    [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
        return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
    }]] continueWithSuccessBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
          if (!_editRentPriceViewController) {
            CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
            CUTERentPriceViewController *controller = [[CUTERentPriceViewController alloc] init];
            CUTERentPriceForm *form = [CUTERentPriceForm new];
            form.currency = ticket.price.unit;
            form.depositType = ticket.depositType;
            form.rentPrice = ticket.price.value;
            form.containBill = ticket.billCovered;
            form.needSetPeriod = ticket.rentPeriod? YES: NO;
            form.startDate = ticket.rentAvailableTime;
            form.period = ticket.rentPeriod;

            [form setAllDepositTypes:[task.result objectAtIndex:0]];
            [form setAllRentPeriods:[task.result objectAtIndex:1]];
            controller.formController.form = form;
            controller.navigationItem.title = STR(@"租金");
            _editRentPriceViewController = controller;
          }
            [self.navigationController pushViewController:_editRentPriceViewController animated:YES];
        }

        return nil;
    }];

}

- (void)editMoreInfo {
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    CUTEPropertyMoreInfoViewController *controller = [CUTEPropertyMoreInfoViewController new];
    CUTEPropertyMoreInfoForm *form = [CUTEPropertyMoreInfoForm new];
    form.ticketTitle = ticket.title;
    form.ticketDescription = ticket.ticketDescription;
    controller.formController.form = form;
    [self.navigationController pushViewController:controller animated:YES];
}

-(void)showErrors {
    NSMutableString *message = [NSMutableString string];

    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;
    [form.errors enumerateKeysAndObjectsUsingBlock:^(NSString *attribute, NSArray *errors, BOOL *stop) {
        for(NSString *error in errors) {
            [message appendFormat:@"- %@\n", error];
        };
    }];

    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Error!"
                                                    message:message
                                                   delegate:nil
                                          cancelButtonTitle:@"OK"
                                          otherButtonTitles:nil];
    [alert show];
}


- (BOOL)validate {
    CUTEPropertyInfoForm *form = (CUTEPropertyInfoForm *)self.formController.form;
    form.scenario = @"submit";
//    if (![form validate]) {
//        [self showErrors];
//        return NO;
//    }
    if (!_editAreaViewController) {
        [SVProgressHUD showErrorWithStatus:STR(@"请编辑面积")];
        return NO;
    }
    if (!_editRentPriceViewController) {
        [SVProgressHUD showErrorWithStatus:STR(@"请编辑租金")];
        return NO;
    }
    return YES;
}

- (void)submit
{
    if (![self validate]) {
        return;
    }

    [SVProgressHUD show];
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    CUTEProperty *property = ticket.property;
    if (ticket && property) {
        Sequencer *sequencer = [Sequencer new];
        NSArray *images = [(CUTEPropertyInfoForm *)self.formController.form photos];
        if (!IsArrayNilOrEmpty(images)) {
            [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
                [[BFTask taskForCompletionOfAllTasksWithResults:[images map:^id(ALAsset *object) {
                    return [self updateImage:object];
                }]] continueWithBlock:^id(BFTask *task) {
                    if (task.error || task.exception || task.isCancelled) {
                        [SVProgressHUD showErrorWithError:task.error];
                        return nil;
                    } else {
                        property.realityImages = task.result;
                        completion(task.result);
                        return nil;
                    }

                }];
            }];
        }

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[self addProperty] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    property.identifier = task.result;
                    completion(task.result);
                    return nil;
                }
            }];
        }];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[[CUTEAPIManager sharedInstance] POST:CONCAT(@"/api/1/property/", property.identifier) parameters:nil resultClass:[CUTEProperty class]] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {

                }
                else {

                }
                completion(task.result);
                return nil;
            }];
        }];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[[CUTEAPIManager sharedInstance] POST:@"/api/1/rent_ticket/add/" parameters:[ticket toParams] resultClass:nil] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    ticket.identifier = task.result;
                    completion(task.result);
                    return nil;
                }
            }];
        }];

        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            [[[CUTEEnumManager sharedInstance] getEnumsByType:@"country"] continueWithBlock:^id(BFTask *task) {
                if (task.error || task.exception || task.isCancelled) {
                    [SVProgressHUD showErrorWithError:task.error];
                    return nil;
                } else {
                    CUTERentContactViewController *contactViewController = [CUTERentContactViewController new];
                    CUTERentContactForm *form = [CUTERentContactForm new];
                    [form setAllCountries:task.result];
                    contactViewController.formController.form = form;
                    [self.navigationController pushViewController:contactViewController animated:YES];
                    [SVProgressHUD dismiss];
                    return nil;
                }
            }];
        }];

        [sequencer run];
    }
}

- (BFTask *)updateImage:(ALAsset*)image {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    if (image) {
        NSData *dataImage = UIImageJPEGRepresentation([UIImage imageWithCGImage:[[image defaultRepresentation] fullResolutionImage]], 1.0);

        if (!_imageUploader) {
            _imageUploader = [BBTRestClient clientWithBaseURL:[NSURL URLWithString:[CUTEConfiguration apiEndpoint]] account:nil];
        }
        [_imageUploader POST:@"/api/1/upload_image" parameters:@{@"thumbnail_size":@"320,213"} constructingBodyWithBlock:^(id<AFMultipartFormData> formData) {
            //do not put image inside parameters dictionary as I did, but append it!
            [formData appendPartWithFileData:dataImage name:@"data" fileName:@"filename.jpg" mimeType:@"image/jpeg"];
        }  success:^(AFHTTPRequestOperation *operation, id responseObject) {
            NSDictionary *responseDic = (NSDictionary *)responseObject;
            if ([[responseDic objectForKey:@"ret"] integerValue] == 0) {
                [tcs setResult:responseDic[@"val"]];
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


- (BFTask *)addProperty {
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    CUTEProperty *property = ticket.property;
    FXFormField *propertyTypeField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:0 inSection:1]];
    property.propertyType = propertyTypeField.value;
    FXFormField *bedroomCountField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:1 inSection:1]];
    property.bedroomCount = [bedroomCountField.value integerValue];
    BFTask *task = [[[CUTEAPIManager sharedInstance] POST:@"/api/1/property/none/edit" parameters:[property toParams] resultClass:nil] continueWithBlock:^id(BFTask *task) {
        NSString *propertyId = task.result;
        property.identifier = propertyId;
        return task;
    }];
    return task;
}



@end
