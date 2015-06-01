//
//  CUTEPropertyListViewController.m
//  currant
//
//  Created by Foster Yin on 3/25/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEPropertyListViewController.h"
#import "CUTEPropertyMapListViewController.h"
#import <BBTJSON.h>
#import "CUTENotificationKey.h"

@implementation CUTEPropertyListViewController

- (void)onMapButtonPressed:(id)sender {
    [[self navigationController] setNavigationBarHidden:YES animated:YES];
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_HIDE_ROOT_TAB_BAR object:nil];

    NSString *rawParams = [self.webView stringByEvaluatingJavaScriptFromString:@"JSON.stringify(window.getBaseRequestParams())"];
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:[rawParams JSONObject]];
    [params setObject:@(1) forKey:@"location_only"];
    NSString *backTitle = [self.webView stringByEvaluatingJavaScriptFromString:@"window.getSummaryTitle()"];
    CUTEPropertyMapListViewController *controller = [CUTEPropertyMapListViewController new];
    controller.backView.label.text = backTitle;
    [self.navigationController pushViewController:controller animated:YES];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.4 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [controller loadMapDataWithParams:params];
    });
}

@end
