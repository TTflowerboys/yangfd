//
//  CUTESettingViewController.m
//  currant
//
//  Created by Foster Yin on 6/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTESettingViewController.h"
#import "CUTESettingForm.h"
#import "CUTECommonMacro.h"
#import <ATConnect.h>
#import <ATEngagementBackend.h>
#import "CUTEConfiguration.h"
#import "CUTEWebViewController.h"
#import <BBTAppUpdater.h>
#import "CUTEAPIManager.h"

@interface CUTESettingViewController ()

@end

@implementation CUTESettingViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.navigationItem.title = STR(@"Setting/设置");
    self.formController.form = [CUTESettingForm new];
}

- (void)tableView:(UITableView *)tableView willDisplayCell:(UITableViewCell *)cell forRowAtIndexPath:(NSIndexPath *)indexPath  {
    FXFormField *field = [self.formController fieldForIndexPath:indexPath];
    if ([field.key isEqualToString:@"version"]) {
        cell.detailTextLabel.text = CONCAT(@"v", [CUTEConfiguration appVersion]);
    }
}

- (void)onFeedBackPressed:(id)sender {
    [[ATConnect sharedConnection] presentMessageCenterFromViewController:self];
}

- (void)onRatePressed:(id)sender {
    [[ATConnect sharedConnection] openAppStore];
}

- (void)onHelpPressed:(id)sender {
    CUTEWebViewController *newWebViewController = [[CUTEWebViewController alloc] init];
    newWebViewController.url = [NSURL URLWithString:@"/qa-app" relativeToURL:[CUTEConfiguration hostURL]];
    newWebViewController.hidesBottomBarWhenPushed = YES;
    [self.navigationController pushViewController:newWebViewController animated:YES];
    [newWebViewController loadRequest:[NSURLRequest requestWithURL:newWebViewController.url]];
}

- (void)onCheckUpdatePressed:(id)sender {
    NSString *checkUrl = @"/api/1/app/currant/check_update";
    NSDictionary *appInfo = [[NSBundle mainBundle] infoDictionary];
    NSDictionary *checkParams = @{@"version":[appInfo objectForKey:(NSString *)kCFBundleVersionKey], @"platform":@"ios", @"channel":[appInfo objectForKey:@"CurrantChannel"]};
    NSURLRequest *request = [[[[CUTEAPIManager sharedInstance] backingManager] requestSerializer] requestWithMethod:@"GET" URLString:[NSURL URLWithString:checkUrl relativeToURL:[CUTEConfiguration hostURL]].absoluteString parameters:checkParams error:nil];
    [[BBTAppUpdater sharedInstance] checkUpdateManuallyWithRequeset:request];

}

- (void)onSurveyPressed:(id)sender {
     
}


@end
