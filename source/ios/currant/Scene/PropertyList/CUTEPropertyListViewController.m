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
#import "CUTETooltipView.h"
#import "CUTECommonMacro.h"
#import "CUTEUserDefaultKey.h"
#import <Aspects.h>
#import "CUTEWebConfiguration.h"

@implementation CUTEPropertyListViewController

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];

    UIBarButtonItem *letItem = self.navigationItem.leftBarButtonItem;

    if (letItem && letItem.tag == FAVORITE_BAR_BUTTON_ITEM_TAG) {

        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
            if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_FAVORITE_PROPERTY_DISPLAYED]) {
                CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetBarButtonItem:self.navigationItem.leftBarButtonItem hostView:self.navigationController.view tooltipText:STR(@"PropertyList/查看收藏的房产") arrowDirection:JDFTooltipViewArrowDirectionUp width:150];
                [toolTips show];

                [self aspect_hookSelector:@selector(viewWillDisappear:) withOptions:AspectPositionBefore | AspectOptionAutomaticRemoval usingBlock:^(id<AspectInfo> aspectInfo) {
                    [toolTips hideAnimated:NO];
                } error:nil];

                [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_FAVORITE_PROPERTY_DISPLAYED];
                [[NSUserDefaults standardUserDefaults] synchronize];
            }
        });
    }
}


- (void)onMapButtonPressed:(id)sender {
    [[self navigationController] setNavigationBarHidden:YES animated:YES];
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_HIDE_ROOT_TAB_BAR object:nil];

    //TODO highlight these js methods used by OC
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
