//
//  CUTEPropertyMoreInfoViewController.m
//  currant
//
//  Created by Foster Yin on 4/13/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPropertyMoreInfoViewController.h"
#import "CUTERentPropertyFacilityViewController.h"
#import "CUTEPropertyFacilityForm.h"
#import "CUTEAPICacheManager.h"
#import <NSArray+ObjectiveSugar.h>
#import "CUTECommonMacro.h"
#import "CUTEDataManager.h"
#import "CUTEPropertyMoreInfoForm.h"
#import "CUTEDataManager.h"
#import "CUTERentTicketPublisher.h"
#import <UIAlertView+Blocks.h>
#import "CUTENotificationKey.h"
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEFormLimitCharacterCountTextFieldCell.h"
#import "CUTEFormTextViewCell.h"
#import "CUTEFormCurrencyTextFieldCell.h"
#import "CUTENavigationUtil.h"
#import "NSURL+Assets.h"
#import "CUTEImageUploader.h"
#import "CUTERentAreaViewController.h"
#import "RegExCategories.h"


@implementation CUTERentPropertyMoreInfoViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"RentPropertyMoreInfo/更多详情");

    self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onLeftButtonPressed:)];
    self.tableView.accessibilityLabel = STR(@"RentPropertyMoreInfo/更多房产信息表单");
    self.tableView.accessibilityIdentifier = self.tableView.accessibilityLabel;
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];

    if (!self.form.ticket.title) {
        [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
            ticket.title = self.form.ticket.titleForDisplay;
        }];
    }

}

- (CUTEPropertyMoreInfoForm *)form {
    return (CUTEPropertyMoreInfoForm *)self.formController.form;
}

- (CUTEFormTextFieldCell *)getTicketTitleCell {
    FXFormField *field = [self.formController fieldForKey:@"ticketTitle"];
    NSIndexPath *indexPath = [self.formController indexPathForField:field];
    CUTEFormTextFieldCell *cell = (CUTEFormTextFieldCell *)[self.tableView cellForRowAtIndexPath:indexPath];
    return cell;
}

- (CUTEFormTextViewCell *)getTicketDescriptionCell {
    FXFormField *field = [self.formController fieldForKey:@"ticketDescription"];
    NSIndexPath *indexPath = [self.formController indexPathForField:field];
    CUTEFormTextViewCell *cell = (CUTEFormTextViewCell *)[self.tableView cellForRowAtIndexPath:indexPath];
    return cell;
}

- (void)onLeftButtonPressed:(id)sender {

    NSString *ticketTitle = self.form.ticketTitle;
    NSString *ticketDescription = self.form.ticketDescription;

    if ([self checkShowTitleLengthWarningAlert:ticketTitle]) {
        return;
    }

    if ([self checkShowContentForbiddenWarningAlert:ticketTitle]) {
        return;
    }

    if ([self checkShowContentForbiddenWarningAlert:ticketDescription]) {
        return;
    }

    [self.navigationController popViewControllerAnimated:YES];
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    if ([field.key isEqualToString:@"ticketTitle"]) {
        CUTEFormLimitCharacterCountTextFieldCell *titleCell = (CUTEFormLimitCharacterCountTextFieldCell *)cell;
        titleCell.limitCount = kTicketTitleMaxCharacterCount;
    }
    else if ([field.key isEqualToString:@"area"]) {
        cell.textLabel.text = STR(@"RentPropertyMoreInfo/房屋面积");

        if (self.form.ticket.property.space) {
            cell.detailTextLabel.text = [NSString stringWithFormat:@"%@ %@", self.form.ticket.property.space.value, self.form.ticket.property.space.unitPresentation];
        }
    }
    else if ([field.key isEqualToString:@"holdingDeposit"]) {
        CUTEFormCurrencyTextFieldCell *textFieldCell = (CUTEFormCurrencyTextFieldCell *)cell;
        [textFieldCell setCurrencySymbol:self.form.currencySymbol];
    }

}

- (void)editArea {

    CUTERentAreaViewController *controller = [CUTERentAreaViewController new];
    CUTEAreaForm *form = [CUTEAreaForm new];
    form.ticket = self.form.ticket;
    form.area = self.form.ticket.property.space.value;
    form.unitPresentation = self.form.ticket.property.space.unitPresentation;
    controller.formController.form = form;

    __weak typeof(self)weakSelf = self;
    controller.updateRentAreaCompletion = ^ {
        [weakSelf.formController enumerateFieldsWithBlock:^(FXFormField *field, NSIndexPath *indexPath) {
            if ([field.key isEqualToString:@"area"]) {
                [[weakSelf tableView] reloadRowsAtIndexPaths:@[indexPath] withRowAnimation:UITableViewRowAnimationNone];
            }
        }];
    };

    //in case of push twice time
    if (![self.navigationController.topViewController isKindOfClass:[CUTERentAreaViewController class]]) {
        [self.navigationController pushViewController:controller animated:YES];
    }
}

- (void)editFacilities {

    NSArray *requiredEnums = @[@"indoor_facility", @"community_facility"];
    [[BFTask taskForCompletionOfAllTasksWithResults:[requiredEnums map:^id(id object) {
        return [[CUTEAPICacheManager sharedInstance] getEnumsByType:object cancellationToken:nil];
    }]] continueWithSuccessBlock:^id(BFTask *task) {
        if (!IsArrayNilOrEmpty(task.result) && [task.result count] == [requiredEnums count]) {
            CUTETicket *ticket = self.form.ticket;
            CUTEProperty *property = [ticket property];
            CUTERentPropertyFacilityViewController *controller = [[CUTERentPropertyFacilityViewController alloc] init];
            CUTEPropertyFacilityForm *form = [CUTEPropertyFacilityForm new];
            form.ticket = self.form.ticket;
            [form setAllIndoorFacilities:task.result[0]];
            [form setSelectedIndoorFacilities:property.indoorFacilities];
            [form setAllCommunityFacilities:task.result[1]];
            [form setSelectedCommunityFacilities:property.communityFacilities];
            controller.formController.form = form;
            [self.navigationController pushViewController:controller animated:YES];
            return nil;
        }

        return nil;
    }];
}


- (void)onTicketTitleEdit:(id)sender {

    CUTEFormTextFieldCell *cell = (CUTEFormTextFieldCell *)sender;
    NSString *string = cell.textField.text;
    if ([self checkShowTitleLengthWarningAlert:string]) {
        return;
    }
    if ([self checkShowContentForbiddenWarningAlert:string]) {
        return;
    }
    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.title = self.form.ticketTitle;
    }];
}

- (void)onTicketDescriptionEdit:(id)sender {
    CUTEFormTextViewCell *cell = (CUTEFormTextViewCell *)sender;
    NSString *string = cell.textView.text;
    if ([self checkShowContentForbiddenWarningAlert:string]) {
        return;
    }

    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        ticket.ticketDescription = self.form.ticketDescription;
    }];
}

- (void)onCurrencyEdit:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        if (IsNilNullOrEmpty(self.form.holdingDeposit) || IsNilNullOrEmpty(self.form.currency)) {
            ticket.holdingDeposit = nil;
        }
        else {
            ticket.holdingDeposit = [CUTECurrency currencyWithValue:self.form.holdingDeposit unit:self.form.currency];
        }
    }];
}

- (void)onHoldingDepositEdit:(id)sender {
    [self.form syncTicketWithBlock:^(CUTETicket *ticket) {
        if (IsNilNullOrEmpty(self.form.holdingDeposit) || IsNilNullOrEmpty(self.form.currency)) {
            ticket.holdingDeposit = nil;
        }
        else {
            ticket.holdingDeposit = [CUTECurrency currencyWithValue:self.form.holdingDeposit unit:self.form.currency];
        }
    }];
}

- (BOOL)checkShowTitleLengthWarningAlert:(NSString *)title {
    if (title.length < kTicketTitleMinCharacterCount) {
        [UIAlertView showWithTitle:[NSString stringWithFormat:STR(@"RentPropertyMoreInfo/标题过短，请至少填写%d个字"), kTicketTitleMinCharacterCount]  message:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/OK") otherButtonTitles:nil tapBlock:nil];
        return YES;
    }
    else if (title.length > kTicketTitleMaxCharacterCount) {
        [UIAlertView showWithTitle:[NSString stringWithFormat:STR(@"RentPropertyMoreInfo/标题超长，请最多填写%d个字") , kTicketTitleMaxCharacterCount] message:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/OK") otherButtonTitles:nil tapBlock:nil];
        return YES;
    }
    return NO;
}

- (BOOL)checkShowContentForbiddenWarningAlert:(NSString *)content {
    if (!IsNilNullOrEmpty(content)) {
        NSError *error;

        //Phone check
        NSDataDetector *detector = [[NSDataDetector alloc] initWithTypes:NSTextCheckingTypePhoneNumber error:&error];
        NSTextCheckingResult *result = [detector firstMatchInString:content options:0 range:NSMakeRange(0, content.length)];
        if (result && result.range.location != NSNotFound) {
            NSString *phone = [content substringWithRange:result.range];
            [UIAlertView showWithTitle:CONCAT(STR(@"RentPropertyMoreInfo/平台将提供房东联系方式选择，请删除“电话"), phone, STR(@"RentPropertyMoreInfo/”，违规发布将会予以处理")) message:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/OK") otherButtonTitles:nil tapBlock:nil];
            return YES;
        }

        //Email check
        NSString *emailRegex = @"[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}";
        NSArray *emailMatches = [content matches:RX(emailRegex)];
        if (emailMatches.count > 0) {
            NSString *result = [emailMatches objectAtIndex:0];
            [UIAlertView showWithTitle:CONCAT(STR(@"RentPropertyMoreInfo/平台将提供房东联系方式选择，请删除“邮箱"), result, STR(@"RentPropertyMoreInfo/”，违规发布将会予以处理") ) message:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/OK") otherButtonTitles:nil tapBlock:nil];
            return YES;
        }

        //black list check
        NSArray *blackList = [CUTERentPropertyMoreInfoViewController contactBlackList];
        __block NSString *blackItem = nil;
        [blackList each:^(id object) {
            if ([[content lowercaseString] containsString:[object lowercaseString]]) {
                blackItem = object;
                return;
            }
        }];

        if (blackItem) {
            [UIAlertView showWithTitle:CONCAT(STR(@"RentPropertyMoreInfo/平台将提供房东联系方式选择，请删除“"), blackItem, STR(@"RentPropertyMoreInfo/”相关信息，违规发布将会予以处理"))  message:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/OK") otherButtonTitles:nil tapBlock:nil];
            return YES;
        }

        //html tag check
        NSString *htmlTagRegext = @"<[^>]*>";
        if ([content isMatch:RX(htmlTagRegext)]) {
            [UIAlertView showWithTitle:STR(@"RentPropertyMoreInfo/请删除HTML相关字符")  message:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/OK") otherButtonTitles:nil tapBlock:nil];
            return YES;
        }
    }

    return NO;
}

+ (NSArray *)contactBlackList {
    static NSArray *blackList = nil;
    if (blackList == nil) {
        NSString *path = [[NSBundle mainBundle] pathForResource:@"contact-blacklist" ofType:@"csv"];
        NSString* fileContents = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
        blackList = [fileContents componentsSeparatedByString:@","];
    }
    return blackList;
}

@end
