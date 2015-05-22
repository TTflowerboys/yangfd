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
#import "NSURL+QueryParser.h"
#import "CUTENotificationKey.h"
#import "MasonryMake.h"
#import "CUTETracker.h"
#import "CUTEDataManager.h"

@interface CUTEWebViewController () <NJKWebViewProgressDelegate>
{
    UIWebView *_webView;

    NJKWebViewProgressView *_progressView;

    NJKWebViewProgress *_progressProxy;

    BOOL _needReloadURL;
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
    _webView = [[UIWebView alloc] initWithFrame:CGRectMake(0, 0, RectWidth(self.view.bounds), RectHeightExclude(self.view.bounds, (StatusBarHeight + TouchHeightDefault + TabBarHeight)))];
    [self.view addSubview:_webView];

    MakeBegin(_webView)
    MakeTopEqualTo(self.view.top);
    MakeBottomEqualTo(self.view.bottom);
    MakeLeftEqualTo(self.view.left);
    MakeRighEqualTo(self.view.right);
    MakeEnd

    _webView.delegate = _progressProxy;
}

- (void)loadURL:(NSURL *)url {
    if ([[CUTEWebConfiguration sharedInstance] isURLLoginRequired:url] && ![[CUTEDataManager sharedInstance] isUserLoggedIn]) {
        url =  [[CUTEWebConfiguration sharedInstance] getRedirectToLoginURLFromURL:url];
    }

    NSURLRequest *urlRequest = [[NSURLRequest alloc] initWithURL:url];
    if (!_webView) {
        [self updateWebView];
    }
    [_webView loadRequest:urlRequest];

    [self setupJSContextWithWebView:_webView];
    [self updateBackButton];
    [self updateRightButtonWithURL:url];
    [self updateTitleWithURL:url];
}

- (void)loadURLInNewController:(NSURL *)url {
    TrackEvent(GetScreenName(self.url), kEventActionPress, GetScreenName(url), nil);
    CUTEWebViewController *newWebViewController = [[CUTEWebViewController alloc] init];
    newWebViewController.url = url;
    newWebViewController.hidesBottomBarWhenPushed = YES;
    [self.navigationController pushViewController:newWebViewController animated:YES];

    //the progress bar need navigationBar
    [newWebViewController loadURL:newWebViewController.url];
}


- (void)updateWithURL:(NSURL *)url {
    [self updateWebView];
    //http://stackoverflow.com/questions/16073519/nsurlerrordomain-error-code-999-in-ios
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self loadURL:url];
    });
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

    [NotificationCenter addObserver:self selector:@selector(onReceiveUserDidLogin:) name:KNOTIF_USER_DID_LOGIN object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveUserDidLogout:) name:KNOTIF_USER_DID_LOGOUT object:nil];
}

- (void)dealloc {
    [NotificationCenter removeObserver:self];
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.navigationController.navigationBar addSubview:_progressView];

    TrackScreen(GetScreenName(self.url));

    if (_needReloadURL) {
        [self updateWithURL:self.url];
    }
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

- (BOOL)webViewCanGoBack {
    return [_webView canGoBack];
}

- (BOOL)viewControllerCanGoBack {
    return [self.navigationController viewControllers].count >= 2 && self.navigationController.topViewController == self;
}

- (void)goBack {
    if ([self webViewCanGoBack]) {
        [_webView goBack];
    }
    else if ([self viewControllerCanGoBack]) {
        [self.navigationController popViewControllerAnimated:YES];
    }

    [self updateBackButton];
}

- (void)updateBackButton {
    BOOL show = [self webViewCanGoBack] || [self viewControllerCanGoBack];
    if  (show) {
        self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(goBack)];
    }
    else {
        [self clearBackButton];
        BBTWebBarButtonItem *leftBarButtonItem = [[CUTEWebConfiguration sharedInstance] getLeftBarItemFromURL:self.url];
        leftBarButtonItem.webView = _webView;
        self.navigationItem.leftBarButtonItem = leftBarButtonItem;
    }
}

- (void)clearBackButton {
    if (self.navigationItem.leftBarButtonItem) {
        self.navigationItem.leftBarButtonItem = nil;
    }
}

- (void)updateRightButtonWithURL:(NSURL *)url {
    BBTWebBarButtonItem *rightBarButtonItem = [[CUTEWebConfiguration sharedInstance] getRightBarItemFromURL:url];
    rightBarButtonItem.webView = _webView;
    self.navigationItem.rightBarButtonItem = rightBarButtonItem;
}

- (void)updateTitleWithURL:(NSURL *)url {
    NSString *webTitle = [_webView stringByEvaluatingJavaScriptFromString:@"document.title"];
    NSString *urlTitle = [[CUTEWebConfiguration sharedInstance] getTitleFormURL:url];
    if (!IsNilNullOrEmpty(webTitle)) {
        self.navigationItem.title = [[_webView stringByEvaluatingJavaScriptFromString:@"document.title"] stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
    }
    else if (!IsNilNullOrEmpty(urlTitle)) {
        self.navigationItem.title = urlTitle;
    }
}



#pragma UIWebViewDelegate

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    //TODO refine the custom scheme action design and replace all the all js call to custom action
    NSURL *url = [request URL];
    if ([url.scheme isEqualToString:[CUTEConfiguration yangfdScheme]]) {
        if ([url.host isEqualToString:@"openURLInNewController"]) {
            [self loadURLInNewController:[NSURL URLWithString:url.path relativeToURL:[CUTEConfiguration hostURL]]];
            return NO;
        }
    }

    return YES;
}


- (void)webViewDidStartLoad:(UIWebView *)webView {

}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
    //http://stackoverflow.com/questions/21714365/uiwebview-javascript-losing-reference-to-ios-jscontext-namespace-object
    [self setupJSContextWithWebView:webView];
    [self updateBackButton];
    [self updateRightButtonWithURL:webView.request.URL];
    [self updateTitleWithURL:webView.request.URL];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    [self setupJSContextWithWebView:webView];
    [self updateBackButton];
    [self updateRightButtonWithURL:webView.request.URL];
    [self updateTitleWithURL:webView.request.URL];
}

#pragma mark - NJKWebViewProgressDelegate
-(void)webViewProgress:(NJKWebViewProgress *)webViewProgress updateProgress:(float)progress
{
    [_progressView setProgress:progress animated:YES];
}

#pragma mark - Notification

- (void)onReceiveUserDidLogin:(NSNotification *)notif {
    if (notif.object != self && [[CUTEWebConfiguration sharedInstance] isURLLoginRequired:self.url]) {
        if (_webView.request.URL && [_webView.request.URL.absoluteString isEqualToString:[[CUTEWebConfiguration sharedInstance] getRedirectToLoginURLFromURL:self.url].absoluteString]) {
            _needReloadURL = YES;
        }
    }
}

- (void)onReceiveUserDidLogout:(NSNotification *)notif {
    if (notif.object != self && [[CUTEWebConfiguration sharedInstance] isURLLoginRequired:self.url]) {
        _needReloadURL = YES;
    }
}

@end
