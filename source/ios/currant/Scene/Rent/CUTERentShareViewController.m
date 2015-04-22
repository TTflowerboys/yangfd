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

@interface CUTERentShareViewController ()

@end

@implementation CUTERentShareViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"完成") style:UIBarButtonItemStylePlain target:self action:@selector(onDoneButtonPressed:)];
    self.navigationItem.title = STR(@"发布成功");
    self.view.backgroundColor = RANDOMCOLOR;
    
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [[CUTEWxManager sharedInstance] shareToWechatWithTitle:self.ticket.title description:self.ticket.ticketDescription url:[[NSURL URLWithString:CONCAT(@"/property-to-rent/", self.ticket.identifier) relativeToURL:[CUTEConfiguration hostURL]] absoluteString]];
    });
}

- (void)onDoneButtonPressed:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];
}


@end
