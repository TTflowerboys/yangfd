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

@interface CUTESettingViewController ()

@end

@implementation CUTESettingViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    self.navigationItem.title = STR(@"设置");
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

- (void)onSurveyPressed:(id)sender {
     
}


@end
