//
//  CUTEWebHandler.h
//  currant
//
//  Created by Foster Yin on 6/27/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "WebViewJavascriptBridge.h"
#import "CUTEWebViewController.h"

@interface CUTEWebHandler : NSObject

@property (strong, nonatomic) WebViewJavascriptBridge *bridge;

- (void)setupWithWebView:(UIWebView *)webView viewController:(CUTEWebViewController *)webViewController;

@end
