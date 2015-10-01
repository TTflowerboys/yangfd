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
#import "NSArray+ObjectiveSugar.h"
#import "NSDate-Utilities.h"
#import "Aspects.h"
#import "NSURL+CUTE.h"
#import "CUTEWebHandler.h"
#import <currant-Swift.h>
#import "CUTELocalizationSwitcher.h"

@interface UINavigationController (Private)

- (void)openRouteWithWebRequest:(NSURLRequest *)URLRequest;

@end


@interface CUTEWebViewController () <NJKWebViewProgressDelegate>
{
    UIWebView *_webView;

    NJKWebViewProgressView *_progressView;

    NJKWebViewProgress *_progressProxy;

    CUTEWebHandler *_webHandler;

    NSURL *_needReloadURL;

    BOOL _reappear;
}


@end

@implementation CUTEWebViewController
@synthesize webView = _webView;


- (NSURL *)originalURL {
    NSDictionary *queryDictionary = [self.URL queryDictionary];
    if (queryDictionary && queryDictionary[@"from"]) {
        return [NSURL URLWithString:[queryDictionary[@"from"] URLDecode]];
    }
    return self.URL;
}

- (id) init {
    self = [super init];
    if (self) {
        //Fix Bug #6364 在iPhone6上依然会出现web页面顶部被header覆盖
        self.edgesForExtendedLayout = UIRectEdgeNone;
    }
    return self;
}

- (void)createOrUpdateWebView:(UIWebView *)webView {
    [_webView removeFromSuperview];
    _webView = nil;
    if (webView) {
        _webView = webView;
    }
    else {
        _webView = [[UIWebView alloc] initWithFrame:CGRectMake(0, 0, RectWidth(self.view.bounds), RectHeightExclude(self.view.bounds, (StatusBarHeight + TouchHeightDefault + TabBarHeight)))];
    }
    [self.view addSubview:_webView];

    MakeBegin(_webView)
    MakeTopEqualTo(self.view.top);
    MakeBottomEqualTo(self.view.bottom);
    MakeLeftEqualTo(self.view.left);
    MakeRighEqualTo(self.view.right);
    MakeEnd

    _webView.delegate = _progressProxy;

    _webHandler = [CUTEWebHandler new];
    _webHandler.bridge = [WebViewJavascriptBridge bridgeForWebView:_webView webViewDelegate:_progressProxy handler:^(id data, WVJBResponseCallback responseCallback) {
    }];
    [_webHandler setupWithWebView:_webView viewController:self];
}

#pragma -mark JS Method

- (BOOL)jsHasObject:(NSString *)jsObjectString {
    return [self jsHasType:jsObjectString type:@"object"];
}

- (BOOL)jsHasFunction:(NSString *)jsFunctionString {
    return [self jsHasType:jsFunctionString type:@"function"];
}

- (BOOL)jsHasType:(NSString *)jsTypeString type:(NSString *)typeString {
    NSString *jsString = [NSString stringWithFormat:@"typeof %@", jsTypeString];
    NSString *result = [self.webView stringByEvaluatingJavaScriptFromString:jsString];
    if ([result caseInsensitiveCompare:typeString] == NSOrderedSame) {
        return YES;
    }
    return NO;
}

- (BOOL)bridgeJSLoaded {
    return [self jsHasObject:@"window.WebViewJavascriptBridge"];
}

- (void)fireDocumentEvent:(NSString *)event {
    [_webHandler.bridge send:@{@"type":@"event", @"content":event}];
}

//TODO move permission check out of the controller, export a delegate


- (void)loadRequest:(NSURLRequest *)originalRequest {
    NSURL *url = [CUTEPermissionChecker URLWithURL:originalRequest.URL];
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
    request.allHTTPHeaderFields = originalRequest.allHTTPHeaderFields;

    if (!_webView) {
        [self createOrUpdateWebView:nil];
    }
    [_webView loadRequest:request];

    [self updateBackButton];
    [self updateRightButtonWithURL:url];
    [self updateTitleWithURL:url];
}

- (void)loadWebArchive:(CUTEWebArchive *)archive {

    if (!_webView) {
        [self createOrUpdateWebView:nil];
    }
    [_webView loadData:archive.data MIMEType:archive.MIMEType textEncodingName:archive.textEncodingName baseURL:archive.URL];

    [self updateBackButton];
    [self updateRightButtonWithURL:archive.URL];
    [self updateTitleWithURL:archive.URL];
}

- (void)updateWithURL:(NSURL *)url {
    [self createOrUpdateWebView:nil];
    //http://stackoverflow.com/questions/16073519/nsurlerrordomain-error-code-999-in-ios
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self loadRequest:[NSURLRequest requestWithURL:url]];
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
    [NotificationCenter addObserver:self selector:@selector(onReceiveUserDidUpdate:) name:KNOTIF_USER_DID_UPDATE object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveTicketListReload:) name:KNOTIF_TICKET_LIST_RELOAD object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveLocalizationDidUpdate:) name:CUTELocalizationDidUpdateNotification object:nil];
}

- (void)dealloc {
    [NotificationCenter removeObserver:self];
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    [self.navigationController.navigationBar addSubview:_progressView];

    if (self.URL) {
        TrackScreen(GetScreenName(self.URL));
    }
    
    if (_needReloadURL) {
        [self updateWithURL:_needReloadURL];
        _needReloadURL = nil;
    }

    if (_reappear) {
        if ([self bridgeJSLoaded]) {
            [self fireDocumentEvent:@"viewreappear"];
        }
        else {
            //TODO log error;
        }
    }
    else {
        _reappear = YES;
    }
}

-(void)viewWillDisappear:(BOOL)animated
{
    [super viewWillDisappear:animated];

    // Remove progress view
    // because UINavigationBar is shared with other ViewControllers
    [_progressView removeFromSuperview];

    if ([self bridgeJSLoaded]) {
        [self fireDocumentEvent:@"viewdisappear"];
    }
    else {
        //TODO log error;
    }
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

- (void)reload {
    NSString *functionExisted = [self.webView stringByEvaluatingJavaScriptFromString:@"typeof window.$currantDropLoad.trigger === 'function'"];
    if ([functionExisted isEqualToString:@"true"]) {
        [self.webView stringByEvaluatingJavaScriptFromString:@"window.$currantDropLoad.trigger('loading')"];
    }
    else {
        [self.webView reload];
    }
}

- (void)updateBackButton {
    BOOL show = [self webViewCanGoBack] || [self viewControllerCanGoBack];
    if  (show) {
        self.navigationItem.leftBarButtonItem = [CUTENavigationUtil backBarButtonItemWithTarget:self action:@selector(goBack)];
    }
    else {
        [self clearBackButton];
        BBTWebBarButtonItem *leftBarButtonItem = [[CUTEWebConfiguration sharedInstance] getLeftBarItemFromURL:self.URL];
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

    if (navigationType == UIWebViewNavigationTypeLinkClicked && [request.URL isHttpOrHttpsURL] && ![webView.request.URL isEquivalent:request.URL]) {
        [self.navigationController openRouteWithWebRequest:request];
        return NO;
    }
    else if ([request.URL isYangfdURL]) {
        [self.navigationController openRouteWithURL:request.URL];
        return NO;
    }

    return YES;
}


- (void)webViewDidStartLoad:(UIWebView *)webView {

}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
    [self updateBackButton];
    [self updateRightButtonWithURL:webView.request.URL];
    [self updateTitleWithURL:webView.request.URL];
    //[[[[[[webView _documentView] webView] mainFrame] dataSource] webArchive] data]
//    NSData *webarchive = [[[[[[webView performSelector:@selector(_documentView)] performSelector:@selector(webView)] performSelector:@selector(mainFrame)] performSelector:@selector(dataSource)] performSelector:@selector(webArchive)] performSelector:@selector(data)];
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

    if (notif.object != self) {
        if ([CUTEPermissionChecker isURLNeedRefreshContentWhenUserUpdate:_webView.request.URL]) {
            _needReloadURL = self.originalURL; //user click into a url need user update, just back to top
        }
        else if (notif.object != self && [CUTEPermissionChecker isURLLoginRequired:self.originalURL]) {
            NSURLComponents *urlComponents = [NSURLComponents componentsWithString:_webView.request.URL.absoluteString];
            if (urlComponents && [urlComponents.path hasPrefix:@"/signin"]) {
                NSURLQueryItem *queryItem = [[urlComponents queryItems] find:^BOOL(NSURLQueryItem *object) {
                    return [[object name] isEqualToString:@"from"];
                }];
                if (queryItem) {
                    _needReloadURL = [NSURL URLWithString:queryItem.value];
                }
            }
            else {
                _needReloadURL = self.originalURL;
            }
        }
    }

}

- (void)onReceiveUserDidLogout:(NSNotification *)notif {
    if (notif.object != self) {
        if ([CUTEPermissionChecker isURLNeedRefreshContentWhenUserUpdate:_webView.request.URL]) {
            _needReloadURL = self.URL; //user click into a url need user update, just back to top
        }
        else if ([CUTEPermissionChecker isURLLoginRequired:self.originalURL]) {
            _needReloadURL = self.URL;
        }
    }
}

- (void)onReceiveUserDidUpdate:(NSNotification *)notif {
    if (notif.object != self) {
        if ([CUTEPermissionChecker isURLNeedRefreshContentWhenUserUpdate:_webView.request.URL]) {
            _needReloadURL = self.originalURL; //user click into a url need user update, just back to top
        }
        else if ([CUTEPermissionChecker isURLLoginRequired:self.originalURL]) {
            _needReloadURL = self.originalURL;
        }
    }
}

- (void)onReceiveTicketListReload:(NSNotification *)notif {

    if (notif.object != self) {
        if (_webView.request.URL.absoluteString) {

            NSURLComponents *urlComponents = [NSURLComponents componentsWithString:_webView.request.URL.absoluteString];
            if ([[urlComponents path] hasPrefix:@"/user-properties"]) {
                _needReloadURL = self.URL;
            }
            else if ([[urlComponents path] hasPrefix:@"/user-favorites"]) {
                _needReloadURL = self.URL;
            }
        }
    }
}

- (void)onReceiveLocalizationDidUpdate:(NSNotification *)notif {
    //alway reload all resource
    [self.webView reload];

    [self updateBackButton];
    [self updateRightButtonWithURL:self.webView.request.URL];
    [self updateTitleWithURL:self.webView.request.URL];
}

- (NSDate *)getHTTPDateWithString:(NSString *)string {

    NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"EEE',' dd' 'MMM' 'yyyy HH':'mm':'ss zzz"];
    return [dateFormatter dateFromString:string];
}

- (void)updateData:(NSData *)data response:(NSURLResponse *)response {
    if ([_webView.request.URL.absoluteString isEqualToString:response.URL.absoluteString]) {
        [_webView loadData:data MIMEType:response.MIMEType textEncodingName:response.textEncodingName baseURL:response.URL];
    }
}


@end
