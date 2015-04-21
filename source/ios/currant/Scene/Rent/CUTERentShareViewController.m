//
//  CUTERentShareViewController.m
//  currant
//
//  Created by Foster Yin on 4/18/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTERentShareViewController.h"
#import "CUTECommonMacro.h"

@interface CUTERentShareViewController ()

@end

@implementation CUTERentShareViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.

    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"完成") style:UIBarButtonItemStylePlain target:self action:@selector(onDoneButtonPressed:)];
    self.navigationItem.title = STR(@"发布成功");
}

- (void)onDoneButtonPressed:(id)sender {
    [self dismissViewControllerAnimated:YES completion:nil];
}

@end
