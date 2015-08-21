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
#import "MasonryMake.h"

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
        property.bedroomCount = @(1);
        property.livingroomCount = @(1);
        property.bathroomCount = @(1);
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

    self.tableView.backgroundView = [UIView new];
    UILabel *hintLabel = [UILabel new];
    hintLabel.textColor = HEXCOLOR(0x999999, 1);
    hintLabel.textAlignment = NSTextAlignmentCenter;
    hintLabel.numberOfLines = 0;
    hintLabel.font = [UIFont systemFontOfSize:16];
    hintLabel.text = STR(@"您有整套或单间房源要出租？\n从这里开始免费发布！");
    [self.tableView.backgroundView addSubview:hintLabel];
    MakeBegin(hintLabel)
    MakeBottomEqualTo(hintLabel.superview.bottom).offset(-135);
    MakeLeftEqualTo(hintLabel.superview);
    MakeRighEqualTo(~)hintLabel.superview);
    MakeEnd
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
