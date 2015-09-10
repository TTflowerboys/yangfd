//
//  CUTEPropertyFacilityViewController.m
//  currant
//
//  Created by Foster Yin on 4/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPropertyFacilityViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEDataManager.h"
#import "CUTEPropertyFacilityForm.h"
#import "CUTEDataManager.h"
#import "CUTERentTicketPublisher.h"
#import "CUTENotificationKey.h"


@implementation CUTERentPropertyFacilityViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"RentPropertyFacility/设施");
}

- (CUTEPropertyFacilityForm *)form {
    return (CUTEPropertyFacilityForm *)self.formController.form;
}

- (void)toggleIndoorFacility:(CUTEEnum *)facility on:(BOOL)on {
    CUTETicket *ticket = self.form.ticket;
    CUTEProperty *property = ticket.property;
    NSMutableArray *oldArray = [NSMutableArray arrayWithArray:property.indoorFacilities];
    NSArray *array = [NSArray array];
    if (on) {
        if (![oldArray containsObject:facility]) {
            array = [oldArray arrayByAddingObject:facility];
        }
    }
    else {
        if ([oldArray containsObject:facility]) {
            [oldArray removeObject:facility];
            array = oldArray;
        }
    }
    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.property.indoorFacilities = array;
    }];
}

- (void)toggleCommunityFacility:(CUTEEnum *)facility on:(BOOL)on {
    CUTETicket *ticket = self.form.ticket;
    CUTEProperty *property = ticket.property;
    NSMutableArray *oldArray = [NSMutableArray arrayWithArray:property.communityFacilities];
    NSArray *array = [NSArray array];
    if (on) {
        if (![oldArray containsObject:facility]) {
            array = [oldArray arrayByAddingObject:facility];
        }
    }
    else {
        if ([oldArray containsObject:facility]) {
            [oldArray removeObject:facility];
            array = oldArray;
        }
    }

    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.property.communityFacilities = array;
    }];
}


- (void)switchChanged:(id)sender {

    if ([sender isKindOfClass:[FXFormSwitchCell class]]) {
        FXFormSwitchCell *switchCell = (FXFormSwitchCell *)sender;
        NSIndexPath *indexPath = [self.tableView indexPathForCell:switchCell];
        CUTEPropertyFacilityForm *form = (CUTEPropertyFacilityForm *)self.formController.form;
        if (indexPath) {
            if (indexPath.section == 0) {
                [self toggleIndoorFacility:[form getIndoorFacilityByKey:switchCell.field.key] on:switchCell.switchControl.on];
            }
            else if (indexPath.section == 1) {
                [self toggleCommunityFacility:[form getCommunityFacilityByKey:switchCell.field.key] on:switchCell.switchControl.on];
            }
        }
        else {
            DebugLog(@"[%@|%@|%d] %@", NSStringFromClass([self class]) , NSStringFromSelector(_cmd) , __LINE__ ,@"bad indexpath");
        }
    }
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTETicket *ticket = self.form.ticket;
    CUTEProperty *property = ticket.property;
    FXFormSwitchCell *switchCell = (FXFormSwitchCell *)cell;
    CUTEPropertyFacilityForm *form = (CUTEPropertyFacilityForm *)self.formController.form;
    if (indexPath.section == 0) {
        switchCell.switchControl.on = [property.indoorFacilities containsObject:[form getIndoorFacilityByKey:switchCell.field.key]];
    }
    else if (indexPath.section == 1) {
        switchCell.switchControl.on = [property.communityFacilities containsObject:[form getCommunityFacilityByKey:switchCell.field.key]];
    }
}

@end
