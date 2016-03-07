//
//  CUTERentListViewController.m
//  currant
//
//  Created by Foster Yin on 6/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentListViewController.h"
#import "CUTECommonMacro.h"
#import "CUTEUIMacro.h"
#import <BBTJSON.h>
#import "CUTERentMapListViewController.h"
#import "CUTEUserDefaultKey.h"
#import "CUTETooltipView.h"
#import "CUTENotificationKey.h"
#import <ALActionBlocks.h>
#import <UIBarButtonItem+ALActionBlocks.h>
#import "BBTWebBarButtonItem.h"
#import <Aspects.h>
#import "CUTEUsageRecorder.h"
#import "CUTESurveyHelper.h"
#import "CUTEWebConfiguration.h"
#import "currant-Swift.h"

@interface CUTERentListViewController ()
{
}

@end



@implementation CUTERentListViewController


- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];

    UIBarButtonItem *letItem = self.navigationItem.leftBarButtonItem;

    if (letItem && letItem.tag == FAVORITE_BAR_BUTTON_ITEM_TAG) {

        dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{

            if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_FAVORITE_RENT_TICKET_DISPLAYED]) {
                CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetBarButtonItem:self.navigationItem.leftBarButtonItem hostView:self.navigationController.view tooltipText:STR(@"RentList/查看收藏的出租房") arrowDirection:JDFTooltipViewArrowDirectionUp width:150];
                [toolTips show];

                [self aspect_hookSelector:@selector(viewWillDisappear:) withOptions:AspectPositionBefore | AspectOptionAutomaticRemoval usingBlock:^(id<AspectInfo> aspectInfo) {
                    [toolTips hideAnimated:NO];
                } error:nil];

                [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_FAVORITE_RENT_TICKET_DISPLAYED];
                [[NSUserDefaults standardUserDefaults] synchronize];
            }

            [CUTESurveyHelper checkShowUserVisitManyRentTicketSurveyWithViewController:self];
        });
    }
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    if ([self.navigationItem.titleView isKindOfClass:[BTNavigationDropdownMenu class]]) {
        BTNavigationDropdownMenu *menu = (BTNavigationDropdownMenu *)self.navigationItem.titleView;
        [menu hide];
    }
}

- (void)willMoveToParentViewController:(UIViewController *)parent {
    //when controller move out, also remove menu
    if (parent == nil) {
        if ([self.navigationItem.titleView isKindOfClass:[BTNavigationDropdownMenu class]]) {
            [BTNavigationDropdownMenuHelper removeMenu];
        }
    }
}

- (void)onMapButtonPressed:(id)sender {
    [[self navigationController] setNavigationBarHidden:YES animated:YES];
    [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_HIDE_ROOT_TAB_BAR object:nil];

    NSString *rawParams = [self.webView stringByEvaluatingJavaScriptFromString:@"JSON.stringify(window.getBaseRequestParams())"];
    NSMutableDictionary *params = [NSMutableDictionary dictionaryWithDictionary:[rawParams JSONObject]];
    [params setObject:@(1) forKey:@"location_only"];
    NSString *backTitle = [self.webView stringByEvaluatingJavaScriptFromString:@"window.getSummaryTitle()"];
    CUTERentMapListViewController *controller = [CUTERentMapListViewController new];
    controller.backView.label.text = backTitle;
    [self.navigationController pushViewController:controller animated:YES];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.4 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [controller loadMapDataWithParams:params];
    });

}

- (void)updateTitleWithURL:(NSURL *)url {

    NSArray *items = @[STR(@"RentList/个人房源或学生公寓"), STR(@"RentList/个人房源"), STR(@"RentList/学生公寓")];
    NSString *isStudentHouse = [url queryDictionary][@"isStudentHouse"];
    NSInteger titleIndex = 0;
    if (isStudentHouse) {
        if ([isStudentHouse isEqualToString:@"true"]) {
            titleIndex = 2;
        }
        else if ([isStudentHouse isEqualToString:@"false"]) {
            titleIndex = 1;
        }
    }

    if (!self.navigationItem.titleView) {
        BTNavigationDropdownMenu *menuView = [BTNavigationDropdownMenuHelper getMenu:self.navigationController title:[items objectAtIndex:titleIndex] items:items didSelectItemAtIndexHandler:^(NSInteger index) {
            [self.webView stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"window.currantModule.selectHouse(\"%@\")", @[@"", @"non_student_house", @"student_house"][index]]];
        }];
        self.navigationItem.titleView = menuView;
    }
    else {
        if ([self.navigationItem.titleView isKindOfClass:[BTNavigationDropdownMenu class]]) {
            BTNavigationDropdownMenu *menu = (BTNavigationDropdownMenu *)self.navigationItem.titleView;
            [menu setMenuTitle:[items objectAtIndex:titleIndex]];
        }
    }
}

@end
