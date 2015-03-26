//
//  CUTEWebViewController.m
//  currant
//
//  Created by Foster Yin on 3/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEWebViewController.h"
#import "CUTEConfiguration.h"

@interface CUTEWebViewController () <UIWebViewDelegate>
{
    UIWebView *_webView;
}

@end

@implementation CUTEWebViewController
@synthesize webView = _webView;

- (id) init {
    self = [super init];
    if (self) {
    }
    return self;
}

- (void)loadURLPath:(NSString *)urlPath {

    NSURLRequest *urlRequest = [[NSURLRequest alloc] initWithURL:[NSURL URLWithString:urlPath relativeToURL:[CUTEConfiguration hostURL]]];
    if (!_webView) {
        _webView = [[UIWebView alloc] initWithFrame:self.view.bounds];
        [self.view addSubview:_webView];
        _webView.delegate = self;
        
        [_webView loadRequest:urlRequest];
    }
    else if (_webView && ![_webView.request.URL.absoluteString isEqualToString:urlRequest.URL.absoluteString]) {
        //if current have webpage load, need clean the web history cache
        //just clean the cache
        [_webView removeFromSuperview];
        _webView = nil;
        _webView = [[UIWebView alloc] initWithFrame:self.view.bounds];
        [self.view addSubview:_webView];
        _webView.delegate = self;
        
        [_webView loadRequest:urlRequest];
    }
}


- (void)onPhoneButtonPressed:(id)sender
{
    NSURL *phoneUrl = [NSURL URLWithString:[NSString  stringWithFormat:@"telprompt:%@",[CUTEConfiguration servicePhone]]];
    
    if ([[UIApplication sharedApplication] canOpenURL:phoneUrl]) {
        [[UIApplication sharedApplication] openURL:phoneUrl];
    } else
    {
        UIAlertView *calert = [[UIAlertView alloc]initWithTitle:STR(@"电话不可用") message:nil delegate:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil, nil];
        [calert show];
    }
}

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

//- (UIStatusBarStyle)preferredStatusBarStyle {
//    return UIStatusBarStyleLightContent;
//}

- (void)updateBackButton {
    BOOL show = [_webView canGoBack];
    if  (show) {
        if (!self.navigationItem.leftBarButtonItem) {
            UIButton *button =  [UIButton buttonWithType:UIButtonTypeCustom];
            [button setImage:[UIImage imageNamed:@"nav-back"] forState:UIControlStateNormal];
            [button setImageEdgeInsets:UIEdgeInsetsMake(0, 0, 0, 37)];
            [button addTarget:_webView action:@selector(goBack)forControlEvents:UIControlEventTouchUpInside];
            [button setFrame:CGRectMake(0, 0, 53, 31)];
            UILabel *label = [[UILabel alloc]initWithFrame:CGRectMake(13, 5, 40, 20)];
            [label setFont:[UIFont systemFontOfSize:17]];
            [label setText:STR(@"返回")];
            label.textAlignment = NSTextAlignmentCenter;
            [label setTextColor:HEXCOLOR(0xe62e3c, 1)];
            [label setBackgroundColor:[UIColor clearColor]];
            [button addSubview:label];
            UIBarButtonItem *barButton = [[UIBarButtonItem alloc] initWithCustomView:button];
            
            self.navigationItem.leftBarButtonItem = barButton;
        }
    }
    else {
        [self clearBackButton];
    }
}

- (void)clearBackButton {
    if (self.navigationItem.leftBarButtonItem) {
        self.navigationItem.leftBarButtonItem = nil;
    }
}

#pragma UIWebViewDelegate

- (void)webViewDidStartLoad:(UIWebView *)webView {
   
}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
    [self updateBackButton];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    [self updateBackButton];
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
