//
//  CUTERentShareViewController.m
//  currant
//
//  Created by Foster Yin on 4/18/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentShareViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEShareManager.h"
#import "CUTEConfiguration.h"
#import "MasonryMake.h"
#import <UIImageView+AFNetworking.h>
#import "CUTEConfiguration.h"
#import "NSString+Encoding.h"
#import "CUTEQrcodeCell.h"
#import "CUTEWebViewController.h"
#import "SVProgressHUD+CUTEAPI.h"

@interface CUTERentShareViewController ()

@end

@implementation CUTERentShareViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"完成") style:UIBarButtonItemStylePlain target:self action:@selector(onDoneButtonPressed:)];
    self.navigationItem.title = STR(@"发布成功");
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self shareToWechat];
    });
}

- (void)shareToWechat {
    [[CUTEShareManager sharedInstance] shareToWechatWithTicket:self.ticket];
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath  {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    if ([field.key isEqualToString:@"view"]) {
        [cell setAccessoryType:UITableViewCellAccessoryDisclosureIndicator];
    }
    else if ([field.key isEqualToString:@"qrcode"]) {
        CUTEQrcodeCell *qrcodeCell = (CUTEQrcodeCell *)cell;
        NSURL *originalURL = [NSURL URLWithString:CONCAT(@"/wechat-poster/", self.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]];
        NSString *content = [[originalURL absoluteString] URLEncode];
        NSString *path = CONCAT(@"/qrcode/generate?content=", content);
        NSURL *url = [NSURL URLWithString:path relativeToURL:[CUTEConfiguration hostURL]];
        [qrcodeCell.qrcodeView setImageWithURL:[NSURL URLWithString:url.absoluteString]];
    }
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    if ([field.key isEqualToString:@"view"]) {
        CUTEWebViewController *controller = [[CUTEWebViewController alloc] init];
        controller.url = [NSURL URLWithString:CONCAT(@"/wechat-poster/", self.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]];
        [controller loadURL:controller.url];
        [self.navigationController pushViewController:controller animated:YES];
    }
    else if ([field.key isEqualToString:@"copyLink"]) {
        [UIPasteboard generalPasteboard].string = [[NSURL URLWithString:CONCAT(@"/wechat-poster/", self.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString];
        [SVProgressHUD showSuccessWithStatus:STR(@"已复制至粘贴版")];
    }
    else if ([field.key isEqualToString:@"qrcode"]) {
        [tableView deselectRowAtIndexPath:indexPath animated:NO];
    }
    else if ([field.key isEqualToString:@"wechat"]) {
        [tableView deselectRowAtIndexPath:indexPath animated:YES];
        [self shareToWechat];
    }

}

- (void)onDoneButtonPressed:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];
}


@end
