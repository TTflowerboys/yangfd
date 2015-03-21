//
//  CUTEWebViewController.m
//  currant
//
//  Created by Foster Yin on 3/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEWebViewController.h"

@interface CUTEWebViewController ()
{
    NSURL *hostURL;
    UIWebView *webView;
}

@end

@implementation CUTEWebViewController

- (id) init {
    self = [super init];
    if (self) {
      hostURL = [NSURL URLWithString:@"http://localhost:8181"];
    }
    return self;
}

- (void)loadURLPath:(NSString *)urlPath {
    if (!webView) {
        webView = [[UIWebView alloc] initWithFrame:CGRectMake(0, 20, CGRectGetWidth(self.view.bounds), CGRectGetHeight(self.view.bounds) - 20)];
        [self.view addSubview:webView];
    }
    
    [webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:urlPath relativeToURL:hostURL]]];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (UIStatusBarStyle)preferredStatusBarStyle {
    return UIStatusBarStyleLightContent;
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
