//
//  CUTEUserViewController.m
//  currant
//
//  Created by Foster Yin on 6/2/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEUserViewController.h"
#import "CUTENavigationUtil.h"
#import "CUTECommonMacro.h"
#import "CUTESettingViewController.h"

@interface CUTEUserViewController ()

@end

@implementation CUTEUserViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)updateBackButton {
    BOOL show = [self webViewCanGoBack] || [self viewControllerCanGoBack];
    if  (show) {
        self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(goBack)];
    }
    else {
        [self clearBackButton];
        UIBarButtonItem *leftBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"设置") style:UIBarButtonItemStylePlain target:self action:@selector(onSettingButtonPressed:)];
        self.navigationItem.leftBarButtonItem = leftBarButtonItem;
    }
}

- (void)onSettingButtonPressed:(id)sender {
    CUTESettingViewController *settingViewController = [CUTESettingViewController new];
    settingViewController.hidesBottomBarWhenPushed = YES;
    [self.navigationController pushViewController:settingViewController animated:YES];
}

@end
