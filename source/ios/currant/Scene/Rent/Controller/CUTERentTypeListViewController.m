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
#import "CUTEEnumManager.h"
#import "CUTETicket.h"
#import "CUTERentTypeListForm.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEFormRentTypeCell.h"
#import "CUTENotificationKey.h"
#import "CUTETracker.h"
#import "CUTETicketEditingListener.h"

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
    if (!self.ticket) {
        CUTETicket *ticket = [CUTETicket new];
        CUTEProperty *property = [CUTEProperty new];
        property.status = kPropertyStatusDraft;
        ticket.status = kTicketStatusDraft;
        ticket.price = [CUTECurrency currencyWithValue:100.0 unit:[CUTECurrency defaultCurrencyUnit]];//default price
        ticket.property = property;
        self.ticket = ticket;
        self.navigationItem.title = STR(@"出租发布");
    }
    else {
        self.navigationItem.title = STR(@"出租类型");
    }
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
    self.ticket.rentType = [form rentTypeAtIndex:indexPath.row];
    [tableView reloadData];

    if (form.singleUseForReedit) {
        [self.navigationController popViewControllerAnimated:YES];

        CUTERentTypeListForm *form = (CUTERentTypeListForm *)[self.formController form];
        CUTETicketEditingListener *ticketListener = [CUTETicketEditingListener createListenerAndStartListenMarkWithSayer:self.ticket];
        self.ticket.rentType = form.rentType;
        [ticketListener stopListenMark];
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:ticketListener.getSyncUserInfo];
        if (self.updateRentTypeCompletion) {
            self.updateRentTypeCompletion();
        }
    }
    else  {
        CUTERentAddressMapViewController *mapController = [CUTERentAddressMapViewController new];
        mapController.ticket = self.ticket;
        mapController.hidesBottomBarWhenPushed = YES;
        [self.navigationController pushViewController:mapController animated:YES];
    }
}


@end
