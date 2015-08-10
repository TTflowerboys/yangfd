//
//  CUTERentPassword2ViewController.m
//  currant
//
//  Created by Foster Yin on 8/8/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

#import "CUTERentPassword2ViewController.h"

@interface CUTERentPassword2ViewController ()

@end

@implementation CUTERentPassword2ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


- (void)onVerificationButtonPressed:(id)sender {
    if (![self validateFormWithScenario:@"fetchCode"]) {
        return;
    }

}


- (void)reset {
    if (![self validateFormWithScenario:@""]) {
        return;
    }

    
}


@end
