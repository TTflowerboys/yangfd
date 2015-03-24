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
    BOOL _loaded;
}

@end

@implementation CUTEWebViewController

- (id) init {
    self = [super init];
    if (self) {
    }
    return self;
}

- (void)loadURLPath:(NSString *)urlPath {
  if (!_loaded) {
    if (!_webView) {
      _webView = [[UIWebView alloc] initWithFrame:self.view.bounds];
      [self.view addSubview:_webView];
      _webView.delegate = self;
    }
    NSURLRequest *urlRequest = [[NSURLRequest alloc] initWithURL:[NSURL URLWithString:urlPath relativeToURL:[CUTEConfiguration hostURL]]];
    [_webView loadRequest:urlRequest];
      _loaded = YES;
  }
}

- (void)onPhoneButtonPressed:(id)sender
{
    NSURL *phoneUrl = [NSURL URLWithString:[NSString  stringWithFormat:@"telprompt:%@",[CUTEConfiguration servicePhone]]];
    
    if ([[UIApplication sharedApplication] canOpenURL:phoneUrl]) {
        [[UIApplication sharedApplication] openURL:phoneUrl];
    } else
    {
        UIAlertView *calert = [[UIAlertView alloc]initWithTitle:STR(@"Phone Not Available") message:nil delegate:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil, nil];
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

- (void)webViewDidStartLoad:(UIWebView *)webView {
//    NSError *error = nil;
//    NSString *css = [NSString stringWithContentsOfFile:[[NSBundle mainBundle] pathForResource:@"base" ofType:@"css"] encoding: NSUTF8StringEncoding error: &error];
//    css = @"\".hiddenInClient {display:none;}\"";
//    NSString* js = [NSString stringWithFormat:
//                    @"var styleNode = document.createElement('style');\n"
//                    "styleNode.type = \"text/css\";\n"
//                    "var styleText = document.createTextNode(%@);\n"
//                    "styleNode.appendChild(styleText);\n"
//                    "document.getElementsByTagName('head')[0].appendChild(styleNode);\n",css];
//    [webView stringByEvaluatingJavaScriptFromString:js];
}

- (void)webViewDidFinishLoad:(UIWebView *)theWebView
{
    
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
