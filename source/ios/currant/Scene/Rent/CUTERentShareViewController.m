//
//  CUTERentShareViewController.m
//  currant
//
//  Created by Foster Yin on 4/18/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentShareViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEWxManager.h"
#import "CUTEConfiguration.h"
#import "MasonryMake.h"
#import <UIImageView+AFNetworking.h>
#import "CUTEConfiguration.h"
#import "NSString+Encoding.h"

@interface CUTERentShareViewController ()

@end

@implementation CUTERentShareViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"完成") style:UIBarButtonItemStylePlain target:self action:@selector(onDoneButtonPressed:)];
    self.navigationItem.title = STR(@"发布成功");
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [[CUTEWxManager sharedInstance] shareToWechatWithTitle:self.ticket.title description:self.ticket.ticketDescription url:[[NSURL URLWithString:CONCAT(@"/wechat-poster/", self.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString]];
    });
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath  {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    if ([field.key isEqualToString:@"view"]) {
        [cell setAccessoryType:UITableViewCellAccessoryDisclosureIndicator];
    }
    else if ([field.key isEqualToString:@"copyLink"]) {
        MakeBegin(cell.textLabel)
        MakeCenterEqualTo(cell.contentView);
        MakeEnd
    }
    else if ([field.key isEqualToString:@"qrcode"]) {
        MakeBegin(cell.imageView)
        MakeCenterEqualTo(cell.contentView);
        MakeEnd

        NSURL *originalURL = [NSURL URLWithString:CONCAT(@"/wechat-poster/", self.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]];
        NSString *content = [[originalURL absoluteString] stringByURLEncoding];
        NSString *path = CONCAT(@"/qrcode/generate?content=", content);
        [cell.imageView setImageWithURL:[NSURL URLWithString:path relativeToURL:[CUTEConfiguration hostURL]]];

    }
    else if ([field.key isEqualToString:@"wechat"]) {
        cell.imageView.image = IMAGE(@"icon-wechat");
        cell.backgroundColor = HEXCOLOR(0x8acd24, 1);
        cell.textLabel.textColor = [UIColor whiteColor];

    }
}

- (void)onDoneButtonPressed:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];
}


@end
