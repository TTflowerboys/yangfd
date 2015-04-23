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
#import "CUTEFormDefaultCell.h"
#import "CUTEDataManager.h"
#import "CUTEEnumManager.h"
#import "CUTETicket.h"
#import "CUTERentTypeListForm.h"
#import "CUTERentAddressMapViewController.h"
#import "CUTECommonMacro.h"

@interface CUTERentTypeListViewController ()


@end




@implementation CUTERentTypeListViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        [self.formController registerDefaultFieldCellClass:[CUTEFormDefaultCell class]];
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"房产类型");
    if (!self.ticket) {
        CUTETicket *ticket = [CUTETicket new];
        CUTEProperty *property = [CUTEProperty new];
        ticket.identifier = [[NSUUID UUID] UUIDString];
        ticket.status = kTicketStatusDraft;
        ticket.property = property;
        self.ticket = ticket;
    }
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    CUTERentTypeListForm *form = (CUTERentTypeListForm *)[self.formController form];
    self.ticket.rentType = [form rentTypeAtIndex:indexPath.row];

    if (self.singleUseForReedit) {
        [self.navigationController popViewControllerAnimated:YES];
    }
    else  {
        CUTERentAddressMapViewController *mapController = [CUTERentAddressMapViewController new];
        mapController.ticket = self.ticket;
        [self.navigationController pushViewController:mapController animated:YES];
    }
}

@end
