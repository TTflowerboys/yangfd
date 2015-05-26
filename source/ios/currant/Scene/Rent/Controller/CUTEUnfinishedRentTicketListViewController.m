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
#import "CUTERentTickePublisher.h"

@interface CUTEUnfinishedRentTicketListViewController ()

@end



@implementation CUTEUnfinishedRentTicketListViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"创建") style:UIBarButtonItemStylePlain target:self action:@selector(onAddButtonPressed:)];
    self.navigationItem.title = STR(@"出租房草稿");
    self.tableView.backgroundColor = HEXCOLOR(0xeeeeee, 1);
    self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    self.refreshControl = [[UIRefreshControl alloc] init];
    [self.refreshControl addTarget:self action:@selector(refreshTable) forControlEvents:UIControlEventValueChanged];
    [self refreshTable];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
}

- (void)refreshTable {
    if (!IsArrayNilOrEmpty(self.unfinishedRentTickets)) {
        [self.tableView reloadData];
    }
    else {
        if ([CUTEDataManager sharedInstance].isUserLoggedIn) {
            [self.refreshControl beginRefreshing];
            [[[CUTERentTickePublisher sharedInstance] syncTickets] continueWithBlock:^id(BFTask *task) {
                if (task.error) {
                    [self.refreshControl endRefreshing];
                    [SVProgressHUD showErrorWithError:task.error];
                }
                else if (task.exception) {
                    [self.refreshControl endRefreshing];
                    [SVProgressHUD showErrorWithException:task.exception];
                }
                else if (task.isCancelled) {
                    [self.refreshControl endRefreshing];
                    [SVProgressHUD showErrorWithCancellation];
                }
                else {
                    self.unfinishedRentTickets = task.result;
                    [self.refreshControl endRefreshing];
                    [self.tableView reloadData];
                }
                return task;
            }];
        }
        else {
            [self.refreshControl beginRefreshing];
            self.unfinishedRentTickets = [[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets];
            [self.refreshControl endRefreshing];
            [self.tableView reloadData];
        }

    }

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
    return self.unfinishedRentTickets.count;
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
    CUTETicket *ticket = [self.unfinishedRentTickets objectAtIndex:indexPath.row];
    [cell updateWithTicket:ticket];
    return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTETicket *ticket = [self.unfinishedRentTickets objectAtIndex:indexPath.row];
    if (ticket) {
        [[[CUTEEnumManager sharedInstance] getEnumsByType:@"property_type"] continueWithBlock:^id(BFTask *task) {
            if (!IsArrayNilOrEmpty(task.result)) {
                CUTERentPropertyInfoViewController *controller = [[CUTERentPropertyInfoViewController alloc] init];
                controller.ticket = ticket;
                CUTEPropertyInfoForm *form = [CUTEPropertyInfoForm new];
                form.propertyType = ticket.property.propertyType;
                form.bedroomCount = ticket.property.bedroomCount;
                form.livingroomCount = ticket.property.livingroomCount;
                form.bathroomCount = ticket.property.bathroomCount;
                [form setAllPropertyTypes:task.result];
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
