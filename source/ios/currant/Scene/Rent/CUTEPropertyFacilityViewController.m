//
//  CUTEPropertyFacilityViewController.m
//  currant
//
//  Created by Foster Yin on 4/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyFacilityViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEDataManager.h"
#import "CUTEPropertyFacilityForm.h"

@implementation CUTEPropertyFacilityViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"设施");
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    CUTEPropertyFacilityForm *form = (CUTEPropertyFacilityForm *)self.formController.form;

    NSMutableArray *indoorFacilities = [NSMutableArray array];
    NSMutableArray *communityFacilities = [NSMutableArray array];
    [self.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
        FXFormSwitchCell *cell = (FXFormSwitchCell *)[self.formController.tableView cellForRowAtIndexPath:indexPath];
        if (indexPath.section == 0) {
            if (cell.switchControl.isOn) {

                [indoorFacilities addObject:[form getIndoorFacilityByKey:field.key]];
            }
        }
        else if (indexPath.section == 1) {
            if (cell.switchControl.isOn) {
                [communityFacilities addObject:[form getCommunityFacilityByKey:field.key]];
            }
        }
    }];

    CUTETicket *ticket = [[CUTEDataManager sharedInstance] currentRentTicket];
    CUTEProperty *property = ticket.property;
    property.indoorFacilities = indoorFacilities;
    property.communityFacilities = communityFacilities;
}

@end
