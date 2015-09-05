//
//  CUTECDVViewController.m
//  currant
//
//  Created by Foster Yin on 9/5/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

#import "CUTECDVViewController.h"
#import "CUTECommonMacro.h"
#import "NSURL+CUTE.h"
#import <NSArray+ObjectiveSugar.h>

#import "BBTWebBarButtonItem.h"
#import "CUTENavigationUtil.h"
#import "CUTEWebConfiguration.h"
#import "CUTETracker.h"
#import "CUTENotificationKey.h"
#import "CUTEDataManager.h"
#import "CUTEWebHandler.h"

@interface CUTECDVViewController () {

    CUTEWebHandler *_webHandler;

    NSURL *_needReloadURL;

    BOOL _reappear;
}

@end

@implementation CUTECDVViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.

    //TODO replace login notification message to js push message
    [NotificationCenter addObserver:self selector:@selector(onReceiveUserDidLogin:) name:KNOTIF_USER_DID_LOGIN object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveUserDidLogout:) name:KNOTIF_USER_DID_LOGOUT object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveUserDidUpdate:) name:KNOTIF_USER_DID_UPDATE object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveClearAllCookies:) name:KNOTIF_CLEAR_ALL_COOKIES object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveTicketListReload:) name:KNOTIF_TICKET_LIST_RELOAD object:nil];

    _webHandler = [CUTEWebHandler new];
    _webHandler.bridge = [WebViewJavascriptBridge bridgeForWebView:self.webView webViewDelegate:self handler:^(id data, WVJBResponseCallback responseCallback) {
    }];
    [_webHandler setupWithWebView:self.webView viewController:self];

}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];

    if (_reappear) {
        [self.commandDelegate evalJs:@"cordova.fireDocumentEvent('viewreappear');"];
    }
    else {
        _reappear = YES;
    }


    if (self.startPage) {
        TrackScreen(GetScreenName([NSURL URLWithString:self.startPage]));
    }

    if (_needReloadURL) {
        //TODO reimplement update webview with native login process
    }
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    [self.commandDelegate evalJs:@"cordova.fireDocumentEvent('viewdisappear');"];
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)dealloc {
    [NotificationCenter removeObserver:self];
}


#pragma Mark - Action
 
- (BOOL)webViewCanGoBack {
    return [self.webView canGoBack];
}

- (BOOL)viewControllerCanGoBack {
    return [self.navigationController viewControllers].count >= 2 && self.navigationController.topViewController == self;
}

- (void)goBack {
    if ([self webViewCanGoBack]) {
        [self.webView goBack];
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
        BBTWebBarButtonItem *leftBarButtonItem = [[CUTEWebConfiguration sharedInstance] getLeftBarItemFromURL:[NSURL URLWithString:self.startPage]];
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
    NSString *webTitle = [self.webView stringByEvaluatingJavaScriptFromString:@"document.title"];
    NSString *urlTitle = [[CUTEWebConfiguration sharedInstance] getTitleFormURL:url];
    if (!IsNilNullOrEmpty(webTitle)) {
        self.navigationItem.title = [[self.webView stringByEvaluatingJavaScriptFromString:@"document.title"] stringByReplacingOccurrencesOfString:@"_" withString:@"-"];
    }
    else if (!IsNilNullOrEmpty(urlTitle)) {
        self.navigationItem.title = urlTitle;
    }
}

- (void)loadRequest:(NSURLRequest *)request {
    NSURL *url = [request URL];
    [self.webView loadRequest:request];

    [self updateBackButton];
    [self updateRightButtonWithURL:url];
    [self updateTitleWithURL:url];
}


- (void)loadRequesetInNewController:(NSURLRequest *)urlRequest {
    NSURL *url = urlRequest.URL;
    TrackEvent(GetScreenName([NSURL URLWithString:self.startPage]), kEventActionPress, GetScreenName(url), nil);
    CUTECDVViewController *newWebViewController = [[CUTECDVViewController alloc] init];
    newWebViewController.startPage = url.absoluteString;
    newWebViewController.hidesBottomBarWhenPushed = YES;
    [self.navigationController pushViewController:newWebViewController animated:YES];
}

- (void)loadWebArchive:(CUTEWebArchive *)archive {

    [self.webView loadData:archive.data MIMEType:archive.MIMEType textEncodingName:archive.textEncodingName baseURL:archive.URL];

    [self updateBackButton];
    [self updateRightButtonWithURL:archive.URL];
    [self updateTitleWithURL:archive.URL];
}


#pragma UIWebViewDelegate

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    if (navigationType == UIWebViewNavigationTypeLinkClicked && [request.URL isHttpOrHttpsURL] && ![webView.request.URL isEquivalent:request.URL]) {
        [self loadRequesetInNewController:request];
        return NO;
    }

    return [super webView:webView shouldStartLoadWithRequest:request navigationType:navigationType];
}


- (void)webViewDidStartLoad:(UIWebView *)webView {
    [super webViewDidStartLoad:webView];
}

- (void)webViewDidFinishLoad:(UIWebView *)webView
{
    [super webViewDidFinishLoad:webView];
    [self updateBackButton];
    [self updateRightButtonWithURL:webView.request.URL];
    [self updateTitleWithURL:webView.request.URL];
}

- (void)webView:(UIWebView *)webView didFailLoadWithError:(NSError *)error {
    [super webView:webView didFailLoadWithError:error];
    [self updateBackButton];
    [self updateRightButtonWithURL:webView.request.URL];
    [self updateTitleWithURL:webView.request.URL];
}

#pragma mark - Notification

- (void)onReceiveUserDidLogin:(NSNotification *)notif {

    if (notif.object != self) {
        if ([[CUTEWebConfiguration sharedInstance] isURLNeedRefreshContentWhenUserChange:self.webView.request.URL]) {
            _needReloadURL = [NSURL URLWithString:self.startPage]; //user click into a url need user update, just back to top
        }
        else if (notif.object != self && [[CUTEWebConfiguration sharedInstance] isURLLoginRequired:[NSURL URLWithString:self.startPage]]) {
            NSURLComponents *urlComponents = [NSURLComponents componentsWithString:self.webView.request.URL.absoluteString];
            if (urlComponents && [urlComponents.URL.absoluteString isEqualToString:[[CUTEWebConfiguration sharedInstance] getRedirectToLoginURLFromURL:[NSURL URLWithString:self.startPage]].absoluteString]) {
                _needReloadURL = [NSURL URLWithString:self.startPage];
            }
            else if (urlComponents && [urlComponents.path hasPrefix:@"/signin"]) {
                NSURLQueryItem *queryItem = [[urlComponents queryItems] find:^BOOL(NSURLQueryItem *object) {
                    return [[object name] isEqualToString:@"from"];
                }];
                if (queryItem) {
                    _needReloadURL = [NSURL URLWithString:queryItem.value];
                }
            }
            else {
                _needReloadURL = [NSURL URLWithString:self.startPage];
            }
        }
    }

}

- (void)onReceiveUserDidLogout:(NSNotification *)notif {
    if (notif.object != self) {
        if ([[CUTEWebConfiguration sharedInstance] isURLNeedRefreshContentWhenUserChange:self.webView.request.URL]) {
            _needReloadURL =  [NSURL URLWithString:self.startPage]; //user click into a url need user update, just back to top
        }
        else if ([[CUTEWebConfiguration sharedInstance] isURLLoginRequired: [NSURL URLWithString:self.startPage]]) {
            _needReloadURL =  [NSURL URLWithString:self.startPage];
        }
    }
}

- (void)onReceiveUserDidUpdate:(NSNotification *)notif {
    if (notif.object != self) {
        if ([[CUTEWebConfiguration sharedInstance] isURLNeedRefreshContentWhenUserChange:self.webView.request.URL]) {
            _needReloadURL = [NSURL URLWithString:self.startPage]; //user click into a url need user update, just back to top
        }
        else if ([[CUTEWebConfiguration sharedInstance] isURLLoginRequired: [NSURL URLWithString:self.startPage]]) {
            _needReloadURL =  [NSURL URLWithString:self.startPage];
        }
    }
}

- (void)onReceiveClearAllCookies:(NSNotification *)notif {
    if (notif.object != self) {
        if ([[CUTEWebConfiguration sharedInstance] isURLNeedRefreshContentWhenUserChange:self.webView.request.URL]) {
            _needReloadURL =  [NSURL URLWithString:self.startPage]; //user click into a url need user update, just back to top
        }
        else if ([[CUTEWebConfiguration sharedInstance] isURLLoginRequired: [NSURL URLWithString:self.startPage]]) {
            _needReloadURL = [NSURL URLWithString:self.startPage];
        }
    }
}

- (void)onReceiveTicketListReload:(NSNotification *)notif {

    if (notif.object != self) {
        if (self.webView.request.URL.absoluteString) {

            NSURLComponents *urlComponents = [NSURLComponents componentsWithString:self.webView.request.URL.absoluteString];
            if ([[urlComponents path] hasPrefix:@"/user-properties"]) {
                _needReloadURL = [NSURL URLWithString:self.startPage];
            }
            else if ([[urlComponents path] hasPrefix:@"/user-favorites"]) {
                _needReloadURL = [NSURL URLWithString:self.startPage];
            }
        }
    }
}




@end
