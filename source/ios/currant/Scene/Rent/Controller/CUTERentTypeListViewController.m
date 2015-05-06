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

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"房产类型");
    if (!self.ticket) {
        CUTETicket *ticket = [CUTETicket new];
        CUTEProperty *property = [CUTEProperty new];
        property.status = kPropertyStatusDraft;
        ticket.status = kTicketStatusDraft;
        ticket.price = [CUTECurrency currencyWithValue:100.0 unit:[CUTECurrency defaultCurrencyUnit]];//default price
        ticket.property = property;
        self.ticket = ticket;
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
    CUTERentTypeListForm *form = (CUTERentTypeListForm *)[self.formController form];
    form.rentType = [form rentTypeAtIndex:indexPath.row];
    self.ticket.rentType = [form rentTypeAtIndex:indexPath.row];
    [tableView reloadData];

    if (self.singleUseForReedit) {
        [self.navigationController popViewControllerAnimated:YES];
        [self updateTicket];
    }
    else  {
        CUTERentAddressMapViewController *mapController = [CUTERentAddressMapViewController new];
        mapController.ticket = self.ticket;
        [self.navigationController pushViewController:mapController animated:YES];
    }
}

- (void)updateTicket {
    CUTERentTypeListForm *form = (CUTERentTypeListForm *)[self.formController form];
    self.ticket.rentType = form.rentType;
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_SYNC object:nil userInfo:@{@"ticket": self.ticket}];
}

@end
