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
#import <NSArray+ObjectiveSugar.h>
#import <ATConnect.h>
#import <ATEngagementBackend.h>
#import "CUTEConfiguration.h"
#import "CUTEWebViewController.h"
#import <BBTAppUpdater.h>
#import "CUTEAPIManager.h"
#import "CUTEWebArchiveManager.h"
#import "CUTELocalizationSwitcher.h"
#import "CUTENavigationUtil.h"
#import "currant-Swift.h"


@interface CUTESettingViewController ()

@end

@implementation CUTESettingViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    [self resetContent];
}

- (void)resetContent {
    self.navigationItem.title = STR(@"Setting/设置");
    CUTESettingForm *form = [CUTESettingForm new];
    form.localization = STR([[CUTELocalizationSwitcher sharedInstance] currentLocalization]);
    [form setLocalizations:[[CUTELocalizationSwitcher sharedInstance].localizations map:^id(id object) {
        return STR(object);
    }]];
    self.formController.form = form;
    self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(onBackButtonPressed:)];
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
    newWebViewController.url = [CUTEPermissionChecker URLWithPath:@"/qa-app"];
    newWebViewController.hidesBottomBarWhenPushed = YES;
    [self.navigationController pushViewController:newWebViewController animated:YES];
    [newWebViewController loadRequest:[NSURLRequest requestWithURL:newWebViewController.url]];
}

- (void)onLocalizationSelected:(id)sender {
    CUTESettingForm *form = (CUTESettingForm *)self.formController.form;
    NSString *oldLang = [[CUTELocalizationSwitcher sharedInstance] currentLocalization];
    NSString *newLang = [[[CUTELocalizationSwitcher sharedInstance] localizations] find:^BOOL(NSString *object) {
        return [STR(object) isEqualToString:form.localization];
    }];

    if (![oldLang isEqualToString:newLang]) {
        [[CUTEWebArchiveManager sharedInstance] clear];
        [[CUTELocalizationSwitcher sharedInstance] setCurrentLocalization:newLang];

        [self.navigationController popViewControllerAnimated:YES];
    }
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

- (void)onReceiveLocalizationDidUpdate:(NSNotification *)notif {
    [self resetContent];
    [self.tableView reloadData];
}

- (void)onBackButtonPressed:(id)sender {
    [self.navigationController popViewControllerAnimated:YES];
}

@end
