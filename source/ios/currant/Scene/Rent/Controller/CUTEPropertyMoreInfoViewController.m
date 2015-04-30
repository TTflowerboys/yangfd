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
#import "CUTEDataManager.h"
#import "CUTERentTickePublisher.h"
#import <UIAlertView+Blocks.h>
#import "CUTENotificationKey.h"

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
            CUTETicket *ticket = self.ticket;
            CUTEProperty *property = [ticket property];
            CUTEPropertyFacilityViewController *controller = [[CUTEPropertyFacilityViewController alloc] init];
            controller.ticket = self.ticket;
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

- (void)delete {
    [UIAlertView showWithTitle:STR(@"删除草稿") message:nil cancelButtonTitle:STR(@"取消") otherButtonTitles:@[STR(@"确定")] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
        if (alertView.cancelButtonIndex != buttonIndex) {
            [self.navigationController popToRootViewControllerAnimated:NO];

            [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_DELETE object:nil userInfo:@{@"ticket": self.ticket}];
        }
    }];
}

- (void)onSaveButtonPressed:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    CUTEPropertyMoreInfoForm *form = (CUTEPropertyMoreInfoForm *)[self.formController form];
    CUTETicket *ticket = self.ticket;
    ticket.title = form.ticketTitle;
    ticket.ticketDescription = form.ticketDescription;
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:@{@"ticket": self.ticket}];
}

@end
