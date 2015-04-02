//
//  CUTERentContactViewController.m
//  currant
//
//  Created by Foster Yin on 4/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentContactViewController.h"
#import "CUTECommonMacro.h"

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

- (void)onRightButtonPressed:(id)sender {

}

@end
