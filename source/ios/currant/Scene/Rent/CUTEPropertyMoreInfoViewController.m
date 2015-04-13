//
//  CUTEPropertyMoreInfoViewController.m
//  currant
//
//  Created by Foster Yin on 4/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyMoreInfoViewController.h"
#import "CUTEPropertyFacilityViewController.h"
#import "CUTEPropertyFacilityForm.h"
#import "CUTEEnumManager.h"
#import <NSArray+Frankenstein.h>
#import "CUTECommonMacro.h"

@implementation CUTEPropertyMoreInfoViewController

- (void)editFacilities {

    NSArray *requiredEnums = @[@"indoor_facility", @"community_facility"];
    [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
        return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
    }]] continueWithSuccessBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
            CUTEPropertyFacilityViewController *controller = [[CUTEPropertyFacilityViewController alloc] init];
            CUTEPropertyFacilityForm *form = [CUTEPropertyFacilityForm new];
            [form setAllIndoorFacilities:task.result[0]];
            [form setAllCommunityFacilities:task.result[1]];
            controller.formController.form = form;
            [self.navigationController pushViewController:controller animated:YES];
            return nil;
        }

        return nil;
    }];
}

@end
