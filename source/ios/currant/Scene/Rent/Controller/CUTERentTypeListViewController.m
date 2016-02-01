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
#import "CUTERentMapEditViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEFormRentTypeCell.h"
#import "CUTENotificationKey.h"
#import "CUTETracker.h"
#import "MasonryMake.h"
#import <currant-Swift.h>
#import <UIBarButtonItem+ALActionBlocks.h>
#import "CUTEConfiguration.h"
#import "CUTEWebViewController.h"


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

- (BFTask *)setupRoute {
    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];
    [[[CUTEAPICacheManager sharedInstance] getEnumsByType:@"rent_type" cancellationToken:nil] continueWithBlock:^id(BFTask *task) {
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
            CUTERentTypeListForm *form = [[CUTERentTypeListForm alloc] init];
            [form setRentTypeList:task.result];
            self.formController.form = form;
            [tcs setResult:task.result];
        }
        return task;
    }];
    return tcs.task;
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
        ticket.price = [CUTECurrency currencyWithValue:@"100.0" unit:[CUTECurrency defaultCurrencyUnit]];//default price
        ticket.holdingDeposit = [CUTECurrency currencyWithValue:@"500.0" unit:[CUTECurrency defaultCurrencyUnit]];// default 500 pounds
        ticket.property = property;
        ticket.rentAvailableTime = [NSNumber numberWithDouble:[[NSDate date] timeIntervalSince1970]];
        ticket.minimumRentPeriod =  [CUTETimePeriod timePeriodWithValue:1 unit:@"day"];

        form.ticket = ticket;
    }

    [self resetContent];
}

- (void)resetContent {

    NSInteger index = [self.navigationController.viewControllers indexOfObject:self];
    self.navigationItem.title = index == 0? STR(@"RentTypeList/出租发布"): STR(@"RentTypeList/出租类型");
    self.tableView.accessibilityLabel = STR(@"RentTypeList/出租类型列表");
    self.tableView.accessibilityIdentifier = STR(@"RentTypeList/出租类型列表");

    if (index == 0) {
         self.tableView.backgroundView = [UIView new];
        UILabel *hintLabel = [UILabel new];
        hintLabel.textColor = HEXCOLOR(0x999999, 1);
        hintLabel.textAlignment = NSTextAlignmentCenter;
        hintLabel.numberOfLines = 0;
        hintLabel.font = [UIFont systemFontOfSize:16];
        hintLabel.text = STR(@"RentTypeList/您有整套或单间房源要出租？\n从这里开始免费发布！");
        CGFloat cellsHeight = 165;
        CGFloat spaceHeight = [UIScreen mainScreen].bounds.size.height - cellsHeight - StatusBarHeight - TouchHeightDefault  - TabBarHeight;
        CGSize textSize = TextSizeOfLabel(hintLabel);
        CGFloat marginBottom = - ((spaceHeight - textSize.height) / 2);

        [self.tableView.backgroundView addSubview:hintLabel];
        MakeBegin(hintLabel)
        MakeBottomEqualTo(hintLabel.superview.bottom).offset(marginBottom);
        MakeLeftEqualTo(hintLabel.superview);
        MakeRighEqualTo(hintLabel.superview);
        MakeEnd
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
        CUTERentMapEditViewController *mapController = [CUTERentMapEditViewController new];
        CUTERentAddressMapForm *mapForm = [CUTERentAddressMapForm new];
        mapForm.ticket = form.ticket;
        mapController.form = mapForm;
        mapController.hidesBottomBarWhenPushed = YES;
        [self.navigationController pushViewController:mapController animated:YES];
    }
}

- (void)onReceiveLocalizationDidUpdate:(NSNotification *)notif {
    CUTERentTypeListForm *form = (CUTERentTypeListForm *)self.formController.form;
    [self resetContent];
    [[[CUTEAPICacheManager sharedInstance] getEnumsByType:@"rent_type" cancellationToken:nil] continueWithBlock:^id(BFTask *task) {
        if (task.result) {
            [form setRentTypeList:task.result];
            [self.formController updateSections];
            [self.tableView reloadData];
        }
        return nil;
    }];
}


@end
