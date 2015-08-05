//
//  CUTERentTypeListViewController.m
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentTypeListViewController.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTERentTypeListForm.h"
#import "CUTEDataManager.h"
#import "CUTEAPICacheManager.h"
#import "CUTETicket.h"
#import "CUTERentTypeListForm.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEFormRentTypeCell.h"
#import "CUTENotificationKey.h"
#import "CUTETracker.h"

@interface CUTERentTypeListViewController ()
{
}

@end




@implementation CUTERentTypeListViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
    }
    return self;
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
}

- (void)viewDidLoad {
    [super viewDidLoad];

    CUTERentTypeListForm *form = (CUTERentTypeListForm *)self.formController.form;
    if (!form.ticket) {
        CUTETicket *ticket = [CUTETicket new];
        CUTEProperty *property = [CUTEProperty new];
        property.status = kPropertyStatusDraft;
        ticket.status = kTicketStatusDraft;
        ticket.price = [CUTECurrency currencyWithValue:100.0 unit:[CUTECurrency defaultCurrencyUnit]];//default price
        ticket.property = property;
        ticket.rentAvailableTime = [NSNumber numberWithDouble:[[NSDate date] timeIntervalSince1970]];
        ticket.minimumRentPeriod =  [CUTETimePeriod timePeriodWithValue:1 unit:@"day"];

        form.ticket = ticket;
        self.navigationItem.title = STR(@"出租发布");
    }
    else {
        self.navigationItem.title = STR(@"出租类型");
    }
    self.tableView.accessibilityLabel = STR(@"出租类型列表");
    self.tableView.accessibilityIdentifier = STR(@"出租类型列表");
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTEFormRentTypeCell *typeCell = (CUTEFormRentTypeCell *)cell;
    CUTERentTypeListForm *form = (CUTERentTypeListForm *)[self.formController form];
    if ([typeCell.field.value isEqual:form.rentType]) {
        cell.accessoryType = UITableViewCellAccessoryCheckmark;
    }
    else {
        cell.accessoryType = UITableViewCellAccessoryNone;
    }
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    TrackScreenStayDuration(KEventCategoryPostRentTicket, GetScreenName(self));

    CUTERentTypeListForm *form = (CUTERentTypeListForm *)[self.formController form];
    form.rentType = [form rentTypeAtIndex:indexPath.row];
    [tableView reloadData];

    if (form.singleUseForReedit) {
        [self.navigationController popViewControllerAnimated:YES];
        [form syncTicketWithBlock:^(CUTETicket *ticket) {
            ticket.rentType = form.rentType;
        }];

        if (self.updateRentTypeCompletion) {
            self.updateRentTypeCompletion();
        }
    }
    else  {
        form.ticket.rentType = form.rentType;
        CUTERentAddressMapViewController *mapController = [CUTERentAddressMapViewController new];
        CUTERentAddressMapForm *mapForm = [CUTERentAddressMapForm new];
        mapForm.ticket = form.ticket;
        mapController.form = mapForm;
        mapController.hidesBottomBarWhenPushed = YES;
        [self.navigationController pushViewController:mapController animated:YES];
    }
}


@end
