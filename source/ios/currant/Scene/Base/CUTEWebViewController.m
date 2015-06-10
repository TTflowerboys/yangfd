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
#import "CUTEWebConfiguration.h"
#import "CUTENavigationUtil.h"
#import "NSURL+QueryParser.h"
#import "CUTENotificationKey.h"
#import "MasonryMake.h"
#import "CUTETracker.h"
#import "CUTEDataManager.h"
#import "WebViewJavascriptBridge.h"
#import "NSString+Encoding.h"

@interface CUTEWebViewController () <NJKWebViewProgressDelegate>
{
    UIWebView *_webView;

    NJKWebViewProgressView *_progressView;

    NJKWebViewProgress *_progressProxy;

    BOOL _needReloadURL;
}

@property (nonatomic, strong) WebViewJavascriptBridge *bridge;

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


    self.bridge = [WebViewJavascriptBridge bridgeForWebView:_webView webViewDelegate:_progressProxy handler:^(id data, WVJBResponseCallback responseCallback) {

    }];
    [self.bridge registerHandler:@"handshake" handler:^(id data, WVJBResponseCallback responseCallback) {
        TrackEvent(KEventCategorySystem, @"handshake", _webView.request.URL.absoluteString, nil);
    }];

    [self.bridge registerHandler:@"login" handler:^(id data, WVJBResponseCallback responseCallback) {
        NSDictionary *dic = data;
        if (dic && [dic isKindOfClass:[NSDictionary class]]) {
            NSError *error = nil;
            CUTEUser *user = (CUTEUser *)[MTLJSONAdapter modelOfClass:[CUTEUser class] fromJSONDictionary:dic error:&error];
            if (!error && user) {
                [[CUTEDataManager sharedInstance] saveAllCookies];
                [[CUTEDataManager sharedInstance] saveUser:user];
            }
        }

        CUTEWebViewController *webViewController = (CUTEWebViewController *)self;
        UIView *view = [self view];
        if (!IsArrayNilOrEmpty(view.subviews) && [[view subviews][0] isKindOfClass:[UIWebView class]]) {
            UIWebView *webView = (UIWebView *)[view subviews][0];
            NSURL *url = [[webView request] URL];
            NSDictionary *queryDictionary = [url queryDictionary];
            if (queryDictionary && queryDictionary[@"from"]) {
                NSString *fromURLStr = [queryDictionary[@"from"] URLDecode];
                [webViewController updateWithURL:[NSURL URLWithString:fromURLStr]];
                [NotificationCenter postNotificationName:KNOTIF_USER_DID_LOGIN object:webViewController];
                responseCallback(nil);
            }
        }
    }];

    [self.bridge registerHandler:@"logout" handler:^(id data, WVJBResponseCallback responseCallback) {

        [[CUTEDataManager sharedInstance] cleanAllCookies];
        [[CUTEDataManager sharedInstance] cleanUser];
        CUTEWebViewController *webViewController = (CUTEWebViewController *)self;
        UIView *view = [self view];
        if (!IsArrayNilOrEmpty(view.subviews) && [[view subviews][0] isKindOfClass:[UIWebView class]]) {
            NSURL *url = [NSURL URLWithString:data relativeToURL:[CUTEConfiguration hostURL]];
            NSDictionary *queryDictionary = [url queryDictionary];
            if (queryDictionary && queryDictionary[@"return_url"]) {
                [webViewController updateWithURL:[NSURL URLWithString:CONCAT([queryDictionary[@"return_url"] URLDecode], @"?from=", [webViewController.url.absoluteString URLEncode]? : @"/") relativeToURL:[CUTEConfiguration hostURL]]];
                [NotificationCenter postNotificationName:KNOTIF_USER_DID_LOGOUT object:webViewController];
            }
        }
    }];

    [self.bridge registerHandler:@"editRentTicket" handler:^(id data, WVJBResponseCallback responseCallback) {

        NSDictionary *dic = data;
        if (dic && [dic isKindOfClass:[NSDictionary class]]) {
            NSError *error = nil;
            CUTETicket *ticket = (CUTETicket *)[MTLJSONAdapter modelOfClass:[CUTETicket class] fromJSONDictionary:dic error:&error];
            if (!error && ticket) {
                [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_EDIT object:self userInfo:@{@"ticket": ticket}];
            }
        }
    }];

    [self.bridge registerHandler:@"createRentTicket" handler:^(id data, WVJBResponseCallback responseCallback) {
        [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_CREATE object:self userInfo:nil];
    }];

    [self.bridge registerHandler:@"wechatShareRentTicket" handler:^(id data, WVJBResponseCallback responseCallback) {
        NSDictionary *dic = data;
        if (dic && [dic isKindOfClass:[NSDictionary class]]) {
            NSError *error = nil;
            CUTETicket *ticket = (CUTETicket *)[MTLJSONAdapter modelOfClass:[CUTETicket class] fromJSONDictionary:dic error:&error];
            if (!error && ticket) {
                [[NSNotificationCenter defaultCenter] postNotificationName:KNOTIF_TICKET_WECHAT_SHARE object:self userInfo:@{@"ticket": ticket}];
            }
        }
    }];

    [self.bridge registerHandler:@"openURLInNewController" handler:^(id data, WVJBResponseCallback responseCallback) {
        [self loadURLInNewController:[NSURL URLWithString:data relativeToURL:[CUTEConfiguration hostURL]]];
    }];
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
        leftBarButtonItem.viewController = self;
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
    rightBarButtonItem.viewController = self;
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
    return YES;
}


- (void)webViewDidStartLoad:(UIWebView *)webView {

}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
    [self updateBackButton];
    [self updateRightButtonWithURL:webView.request.URL];
    [self updateTitleWithURL:webView.request.URL];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
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
