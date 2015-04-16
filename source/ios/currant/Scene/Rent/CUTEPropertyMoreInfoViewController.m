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
#import "CUTEDataManager.h"
#import "CUTEPropertyMoreInfoForm.h"

@implementation CUTEPropertyMoreInfoViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"保存") style:UIBarButtonItemStylePlain target:self action:@selector(onSaveButtonPressed:)];
}

- (void)editFacilities {

    NSArray *requiredEnums = @[@"indoor_facility", @"community_facility"];
    [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
        return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
    }]] continueWithSuccessBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
            CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
            CUTEProperty *property = [ticket property];
            CUTEPropertyFacilityViewController *controller = [[CUTEPropertyFacilityViewController alloc] init];
            CUTEPropertyFacilityForm *form = [CUTEPropertyFacilityForm new];
            [form setAllIndoorFacilities:task.result[0]];
            [form setSelectedIndoorFacilities:property.indoorFacilities];
            [form setAllCommunityFacilities:task.result[1]];
            [form setSelectedCommunityFacilities:property.communityFacilities];
            controller.formController.form = form;
            [self.navigationController pushViewController:controller animated:YES];
            return nil;
        }

        return nil;
    }];
}

- (void)onSaveButtonPressed:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    CUTEPropertyMoreInfoForm *form = (CUTEPropertyMoreInfoForm *)[self.formController form];
    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    ticket.title = form.ticketTitle;
    ticket.ticketDescription = form.ticketDescription;
}

@end
