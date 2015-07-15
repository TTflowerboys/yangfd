//
//  CUTEUnfinishedRentTicketViewController.m
//  currant
//
//  Created by Foster Yin on 4/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUnfinishedRentTicketListViewController.h"
#import "CUTECommonMacro.h"
#import "CUTERentTypeListViewController.h"
#import "CUTERentTypeListForm.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEEnumManager.h"
#import "CUTETicket.h"
#import "CUTEDataManager.h"
#import "CUTERentPropertyInfoViewController.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEUnfinishedRentTicketCell.h"
#import "CUTENotificationKey.h"
#import "CUTEAPIManager.h"
#import "NSArray+ObjectiveSugar.h"
#import "CUTERentTicketPublisher.h"
#import "CUTEUIMacro.h"

@interface CUTEUnfinishedRentTicketListViewController ()


@end



@implementation CUTEUnfinishedRentTicketListViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"创建") style:UIBarButtonItemStylePlain target:self action:@selector(onAddButtonPressed:)];
    self.navigationItem.title = STR(@"出租房草稿");
    self.tableView.backgroundColor = CUTE_BACKGROUND_COLOR;
    self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    self.refreshControl = [[UIRefreshControl alloc] init];
    [self.refreshControl addTarget:self action:@selector(refreshTable) forControlEvents:UIControlEventValueChanged];
//    [self refreshTable];
    self.tableView.accessibilityLabel = STR(@"出租房草稿列表");
    self.tableView.accessibilityIdentifier = self.tableView.accessibilityLabel;
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
}

- (void)refreshTable {
    [self.refreshControl beginRefreshing];
    [[self.form reload] continueWithBlock:^id(BFTask *task) {
        [self.refreshControl endRefreshing];
        if (task.error) {
            [SVProgressHUD showErrorWithError:task.error];
        }
        else if (task.exception) {
            [SVProgressHUD showErrorWithException:task.exception];
        }
        else if (task.isCancelled) {
            [SVProgressHUD showErrorWithCancellation];
        }
        else {
            [self.tableView reloadData];
        }
        
        return task;
    }];


    //scroll to the top, the first one is the recent edit one
//    [self.tableView scrollToRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0] atScrollPosition:UITableViewScrollPositionTop animated:NO];
}

- (void)onAddButtonPressed:(id)sender {
    [SVProgressHUD show];
    [[[CUTEEnumManager sharedInstance] getEnumsByType:@"rent_type"] continueWithBlock:^id(BFTask *task) {
        if (task.result) {
            CUTERentTypeListForm *form = [[CUTERentTypeListForm alloc] init];
            [form setRentTypeList:task.result];
            CUTERentTypeListViewController *controller = [CUTERentTypeListViewController new];
            controller.formController.form = form;
            controller.hidesBottomBarWhenPushed = YES;
            [self.navigationController pushViewController:controller animated:YES];
            [SVProgressHUD dismiss];
        }
        else {
            [SVProgressHUD showErrorWithError:task.error];
        }
        return nil;
    }];
}

#pragma mark - UITableViewDataSource

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    return self.form.unfinishedRentTickets.count;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    return 268 + 10;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTEUnfinishedRentTicketCell *cell = [tableView dequeueReusableCellWithIdentifier:@"ticketCell"];
    if (!cell) {
        cell = [[CUTEUnfinishedRentTicketCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:@"ticketCell"];
    }
    CUTETicket *ticket = [self.form.unfinishedRentTickets objectAtIndex:indexPath.row];
    [cell updateWithTicket:ticket];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTETicket *ticket = [self.form.unfinishedRentTickets objectAtIndex:indexPath.row];
    if (ticket) {
        [[BFTask taskForCompletionOfAllTasksWithResults:[@[@"landlord_type", @"property_type"] map:^id(id object) {
            return [[CUTEEnumManager sharedInstance] getEnumsByType:object];
        }]] continueWithBlock:^id(BFTask *task) {
            NSArray *landloardTypes = nil;
            NSArray *propertyTypes = nil;
            if (!IsArrayNilOrEmpty(task.result) && [task.result count] == 2) {
                landloardTypes = task.result[0];
                propertyTypes = task.result[1];
            }
            if (!IsArrayNilOrEmpty(landloardTypes) && !IsArrayNilOrEmpty(propertyTypes)) {
                CUTERentPropertyInfoViewController *controller = [[CUTERentPropertyInfoViewController alloc] init];
                CUTEPropertyInfoForm *form = [CUTEPropertyInfoForm new];
                form.ticket = ticket;
                form.propertyType = ticket.property.propertyType;
                form.bedroomCount = ticket.property.bedroomCount? ticket.property.bedroomCount.integerValue: 0;
                form.livingroomCount = ticket.property.livingroomCount? ticket.property.livingroomCount.integerValue: 0;
                form.bathroomCount = ticket.property.bathroomCount? ticket.property.bathroomCount.integerValue: 0;
                [form setAllPropertyTypes:propertyTypes];
                [form setAllLandlordTypes:landloardTypes];
                controller.formController.form = form;
                controller.hidesBottomBarWhenPushed = YES;
                [self.navigationController pushViewController:controller animated:YES];
            }
            else {
                [SVProgressHUD showErrorWithError:task.error];
            }

            return nil;
        }];
    }
}



@end
