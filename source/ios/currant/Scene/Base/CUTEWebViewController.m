//
//  CUTEWebViewController.m
//  currant
//
//  Created by Foster Yin on 3/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTEWebViewController.h"
#import "CUTEConfiguration.h"
#import <NJKWebViewProgressView.h>
#import <NJKWebViewProgress.h>
#import "CUTEUIMacro.h"
#import "CUTECommonMacro.h"
#import <JavaScriptCore/JavaScriptCore.h>
#import <JavaScriptCore/JSValue.h>
#import "CUTEMoblieClient.h"
#import "CUTEWebConfiguration.h"
#import "CUTENavigationUtil.h"

@interface CUTEWebViewController () <NJKWebViewProgressDelegate>
{
    UIWebView *_webView;

    NJKWebViewProgressView *_progressView;

    NJKWebViewProgress *_progressProxy;
}

@end

@implementation CUTEWebViewController
@synthesize webView = _webView;

- (id) init {
    self = [super init];
    if (self) {
        //Fix Bug #6364 在iPhone6上依然会出现web页面顶部被header覆盖
        self.edgesForExtendedLayout = UIRectEdgeNone;
    }
    return self;
}

- (void)setupJSContextWithWebView:(UIWebView *)webView {
    JSContext *jsContext = [webView valueForKeyPath:@"documentView.webView.mainFrame.javaScriptContext"];
    CUTEMoblieClient *mobileClient = [CUTEMoblieClient new];
    mobileClient.controller = self;
    jsContext[@"window"][@"mobileClient"] = mobileClient;
}

- (void)updateWebView {
    [_webView removeFromSuperview];
    _webView = nil;
    _webView = [[UIWebView alloc] initWithFrame:TabBarControllerViewFrame];
    [self.view addSubview:_webView];
    _webView.delegate = _progressProxy;
    [self setupJSContextWithWebView:_webView];
}

- (void)loadURL:(NSURL *)url {
    url = [[CUTEWebConfiguration sharedInstance] getRedirectToLoginURLFromURL:url];
    NSURLRequest *urlRequest = [[NSURLRequest alloc] initWithURL:url];
    if (!_webView) {
        [self updateWebView];
    }
    [_webView loadRequest:urlRequest];
}

- (void)updateWithURL:(NSURL *)url {
    [self updateWebView];
    [self loadURL:url];
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    _progressProxy = [[NJKWebViewProgress alloc] init];
    _progressProxy.webViewProxyDelegate = self;
    _progressProxy.progressDelegate = self;

    CGFloat progressBarHeight = 2.f;
    CGRect navigaitonBarBounds = self.navigationController.navigationBar.bounds;
    CGRect barFrame = CGRectMake(0, navigaitonBarBounds.size.height - progressBarHeight, navigaitonBarBounds.size.width, progressBarHeight);
    _progressView = [[NJKWebViewProgressView alloc] initWithFrame:barFrame];
    _progressView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin;
    _progressView.progressBarView.backgroundColor =  CUTE_MAIN_COLOR;
    [self loadURL:self.url];
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.navigationController.navigationBar addSubview:_progressView];

}

-(void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];

    // Remove progress view
    // because UINavigationBar is shared with other ViewControllers
    [_progressView removeFromSuperview];
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
            self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:_webView action:@selector(goBack)];
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

- (void)updateRightButton {
    BBTWebBarButtonItem *rightBarButtonItem = [[CUTEWebConfiguration sharedInstance] getRightBarItemFromURL:_webView.request.URL];
    rightBarButtonItem.webView = _webView;
    self.navigationItem.rightBarButtonItem = rightBarButtonItem;
}

#pragma UIWebViewDelegate

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    return YES;
}


- (void)webViewDidStartLoad:(UIWebView *)webView {
    [self setupJSContextWithWebView:webView];
    [self updateBackButton];
    [self updateRightButton];
}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
    //http://stackoverflow.com/questions/21714365/uiwebview-javascript-losing-reference-to-ios-jscontext-namespace-object
    [self setupJSContextWithWebView:webView];
    [self updateBackButton];
    [self updateRightButton];
    self.navigationItem.title = [webView stringByEvaluatingJavaScriptFromString:@"document.title"];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    [self setupJSContextWithWebView:webView];
    [self updateBackButton];
    [self updateRightButton];
    self.navigationItem.title = [webView stringByEvaluatingJavaScriptFromString:@"document.title"];
}

#pragma mark - NJKWebViewProgressDelegate
-(void)webViewProgress:(NJKWebViewProgress *)webViewProgress updateProgress:(float)progress
{
    [_progressView setProgress:progress animated:YES];
}

@end
