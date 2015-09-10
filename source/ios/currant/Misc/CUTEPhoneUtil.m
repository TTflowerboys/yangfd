//
//  CUTEPhoneUtil.m
//  currant
//
//  Created by Foster Yin on 8/6/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

#import "CUTEPhoneUtil.h"
#import <UIKit/UIKit.h>
#import "CUTEConfiguration.h"
#import "CUTECommonMacro.h"
#import <UIAlertView+Blocks.h>

@implementation CUTEPhoneUtil

+ (void)showServicePhoneAlert {
    NSURL *phoneUrl = [NSURL URLWithString:[NSString  stringWithFormat:@"telprompt:%@",[CUTEConfiguration servicePhone]]];

    if ([[UIApplication sharedApplication] canOpenURL:phoneUrl]) {

        [UIAlertView showWithTitle:STR(@"PhoneUtil/联系洋房东") message:nil cancelButtonTitle:STR(@"PhoneUtil/取消") otherButtonTitles:@[CONCAT(STR(@"PhoneUtil/英国"), @" ", [CUTEConfiguration ukServicePhone]), CONCAT(STR(@"PhoneUtil/中国"), @" ", [CUTEConfiguration servicePhone])] tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {
            if (buttonIndex == 1) {
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[NSString  stringWithFormat:@"tel:%@",[CUTEConfiguration ukServicePhone]]]];
            }
            else if (buttonIndex == 2) {
                [[UIApplication sharedApplication] openURL:[NSURL URLWithString:[NSString  stringWithFormat:@"tel:%@",[CUTEConfiguration servicePhone]]]];
            }
        }];

    } else
    {
        UIAlertView *calert = [[UIAlertView alloc]initWithTitle:STR(@"PhoneUtil/电话不可用") message:nil delegate:nil cancelButtonTitle:STR(@"PhoneUtil/OK") otherButtonTitles:nil, nil];
        [calert show];
    }

}

@end
