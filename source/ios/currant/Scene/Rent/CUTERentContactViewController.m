//
//  CUTERentContactViewController.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentContactViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEFormVerificationCodeCell.h"
#import "CUTEAPIManager.h"
#import "CUTEEnum.h"
#import <WXApi.h>

@interface CUTERentContactViewController () {
    NSString *_verificationToken;
}

@end


@implementation CUTERentContactViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title = STR(@"联系方式");
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"发布到微信") style:UIBarButtonItemStylePlain target:self action:@selector(onRightButtonPressed:)];
    UILabel * label = [UILabel new];
    NSString *str = STR(@"确认代表您同意创建一个洋房东账号供以后查看租客请求使用");
    NSMutableAttributedString* attrString = [[NSMutableAttributedString alloc] initWithString:str attributes:@{NSForegroundColorAttributeName: HEXCOLOR(0x999999, 1.0)}];
    NSMutableParagraphStyle *style = [[NSMutableParagraphStyle alloc] init];
    [style setLineSpacing:8];
    [attrString addAttribute:NSParagraphStyleAttributeName
                       value:style
                       range:NSMakeRange(0, str.length)];
    label.attributedText = attrString;
    label.font = [UIFont systemFontOfSize:12];
    label.numberOfLines = 0;
    label.textAlignment = NSTextAlignmentCenter;
    label.frame = CGRectMake(RectWidthExclude(self.view.bounds, 240) / 2, 40, 240, 60);
    UIView *footerView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, ScreenWidth, 100)];
    [footerView addSubview:label];
    self.tableView.tableFooterView = footerView;
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath {
    if ([cell isKindOfClass:[CUTEFormVerificationCodeCell class]]) {
        CUTEFormVerificationCodeCell *codeCell = (CUTEFormVerificationCodeCell *)cell;
        [codeCell.verificationButton addTarget:self action:@selector(onVerificationButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    }
}

- (void)onVerificationButtonPressed:(id)sender {

    CUTEEnum *country = [[self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:1 inSection:0]] value];
    NSString *phone = [[self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:2 inSection:0]] value];
    [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/sms_verification/send" parameters:@{@"phone":phone, @"country":country.identifier} resultClass:nil] continueWithBlock:^id(BFTask *task) {

        return nil;
    }];
}

- (void)onRightButtonPressed:(id)sender {

//     FXFormField *propertyTypeField = [self.formController fieldForIndexPath:[NSIndexPath indexPathForRow:0 inSection:1]];

}

@end
