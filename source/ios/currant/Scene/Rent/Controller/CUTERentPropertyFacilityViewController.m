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
#import "CUTETicketEditingListener.h"

@implementation CUTERentPropertyFacilityViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"设施");
}

- (void)toggleIndoorFacility:(CUTEEnum *)facility on:(BOOL)on {
    CUTETicketEditingListener *tickeListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    CUTETicket *ticket = self.ticket;
    CUTEProperty *property = ticket.property;
    NSMutableArray *oldArray = [NSMutableArray arrayWithArray:property.indoorFacilities];
    if (on) {
        if (![oldArray containsObject:facility]) {
            property.indoorFacilities = [oldArray arrayByAddingObject:facility];
        }
    }
    else {
        if ([oldArray containsObject:facility]) {
            [oldArray removeObject:facility];
            property.indoorFacilities = oldArray;
        }
    }
    [tickeListener stopListenMark];
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:tickeListener.getSyncUserInfo];
}

- (void)toggleCommunityFacility:(CUTEEnum *)facility on:(BOOL)on {
    CUTETicketEditingListener *tickeListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
    CUTETicket *ticket = self.ticket;
    CUTEProperty *property = ticket.property;
    NSMutableArray *oldArray = [NSMutableArray arrayWithArray:property.communityFacilities];
    if (on) {
        if (![oldArray containsObject:facility]) {
            property.communityFacilities = [oldArray arrayByAddingObject:facility];
        }
    }
    else {
        if ([oldArray containsObject:facility]) {
            [oldArray removeObject:facility];
            property.communityFacilities = oldArray;
        }
    }
    [tickeListener stopListenMark];
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:tickeListener.getSyncUserInfo];
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
    CUTETicket *ticket = self.ticket;
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
