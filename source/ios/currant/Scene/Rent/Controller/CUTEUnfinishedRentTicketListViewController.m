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
#import "CUTEAPICacheManager.h"
#import "CUTETicket.h"
#import "CUTEDataManager.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEUnfinishedRentTicketCell.h"
#import "CUTENotificationKey.h"
#import "CUTEAPIManager.h"
#import "NSArray+ObjectiveSugar.h"
#import <UIBarButtonItem+ALActionBlocks.h>
#import "CUTERentTicketPublisher.h"
#import "CUTEUIMacro.h"
#import "CUTETracker.h"
#import "CUTEConfiguration.h"
#import "CUTEWebViewController.h"
#import "currant-Swift.h"
#import <HHRouter.h>


@interface CUTEUnfinishedRentTicketListViewController () {

    BFCancellationTokenSource *_cts;
}

@end



@implementation CUTEUnfinishedRentTicketListViewController

- (BFTask *)setupRoute {
    
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    if (self.params && [self.params[@"status"] isEqualToString:@"draft"]) {

        if ([self.params[@"_reload"] isEqualToString:@"false"]) {
            NSArray *result = [[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets];
            CUTEUnfinishedRentTicketListForm *form = [CUTEUnfinishedRentTicketListForm new];
            self.form = form;
            self.form.unfinishedRentTickets = result;
            [tcs setResult:result];
            [self.tableView reloadData];
        }
        else {
            CUTEUnfinishedRentTicketListForm *form = [CUTEUnfinishedRentTicketListForm new];
            self.form = form;
            _cts = [BFCancellationTokenSource cancellationTokenSource];
            [[self.form reloadWithCancellationToken:_cts.token] continueWithBlock:^id(BFTask *task) {
                _cts = nil;
                if (task.error) {
                    [tcs setError:task.error];
                }
                else if (task.exception) {
                    [tcs setException:task.exception];
                }
                else if (task.isCancelled) {
                    [tcs cancel];
                }
                else {
                    [tcs setResult:nil];
                    [self.tableView reloadData];
                }
                
                return task;
            }];
        }
    }
    else {
        [tcs setError:[NSError errorWithDomain:CUTE_ERROR_DOMAIN code:-1 userInfo:@{NSLocalizedDescriptionKey: @"Unsupported Status"}]];
    }
    return tcs.task;
}

- (void)viewDidLoad {
    [super viewDidLoad];

    self.tableView.backgroundColor = CUTE_BACKGROUND_COLOR;
    self.tableView.separatorStyle = UITableViewCellSeparatorStyleNone;
    self.refreshControl = [[UIRefreshControl alloc] init];
    [self.refreshControl addTarget:self action:@selector(refreshTable) forControlEvents:UIControlEventValueChanged];
    [self resetContent];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveLocalizationDidUpdate:) name:CUTELocalizationDidUpdateNotification object:nil];
}

- (void)resetContent {
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"UnfinishedRentTicketList/创建") style:UIBarButtonItemStylePlain target:self action:@selector(onAddButtonPressed:)];
    self.navigationItem.title = STR(@"UnfinishedRentTicketList/出租房草稿");

    self.tableView.accessibilityLabel = STR(@"UnfinishedRentTicketList/出租房草稿列表");
    self.tableView.accessibilityIdentifier = self.tableView.accessibilityLabel;
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    TrackScreen(GetScreenName(self));
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];

    //cancel current request if switch page
    if (_cts) {
        [_cts cancel];
    }
}

- (void)refreshTable {
    [self.refreshControl beginRefreshing];
    _cts = [BFCancellationTokenSource cancellationTokenSource];
    [[self.form reloadWithCancellationToken:_cts.token] continueWithBlock:^id(BFTask *task) {
        [self.refreshControl endRefreshing];
        _cts = nil;
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
    [[[CUTEAPICacheManager sharedInstance] getEnumsByType:@"rent_type"] continueWithBlock:^id(BFTask *task) {
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

    TrackEvent(GetScreenName(self), kEventActionPress, @"item", nil);
    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

    CUTETicket *ticket = [self.form.unfinishedRentTickets objectAtIndex:indexPath.row];
    if (ticket) {
        [self.navigationController openRouteWithURL:[NSURL URLWithString:CONCAT(@"yangfd://property-to-rent/edit/", ticket.identifier)]];
    }
}

- (void)onReceiveLocalizationDidUpdate:(NSNotification *)notif {
    [self resetContent];
    [self refreshTable];
}



@end
