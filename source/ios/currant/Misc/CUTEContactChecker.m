//
//  CUTEContactChecker.m
//  currant
//
//  Created by Foster Yin on 6/17/16.
//  Copyright © 2016 BBTechgroup. All rights reserved.
//

#import "CUTEContactChecker.h"
#import "CUTECommonMacro.h"
#import <UIAlertView+Blocks.h>
#import <RegExCategories.h>
#import <NSArray+ObjectiveSugar.h>

@implementation CUTEContactChecker

+ (BOOL)checkShowContactForbiddenWarningAlert:(NSString *)content {
    if (!IsNilNullOrEmpty(content)) {
        NSError *error;

        //Phone check
        NSDataDetector *detector = [[NSDataDetector alloc] initWithTypes:NSTextCheckingTypePhoneNumber error:&error];
        NSTextCheckingResult *result = [detector firstMatchInString:content options:0 range:NSMakeRange(0, content.length)];
        if (result && result.range.location != NSNotFound) {
            NSString *phone = [content substringWithRange:result.range];
            [UIAlertView showWithTitle:CONCAT(STR(@"RentPropertyMoreInfo/平台将提供房东联系方式选择，请删除“电话"), phone, STR(@"RentPropertyMoreInfo/”，违规发布将会予以处理")) message:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/OK") otherButtonTitles:nil tapBlock:nil];
            return YES;
        }

        //Email check
        NSString *emailRegex = @"[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}";
        NSArray *emailMatches = [content matches:RX(emailRegex)];
        if (emailMatches.count > 0) {
            NSString *result = [emailMatches objectAtIndex:0];
            [UIAlertView showWithTitle:CONCAT(STR(@"RentPropertyMoreInfo/平台将提供房东联系方式选择，请删除“邮箱"), result, STR(@"RentPropertyMoreInfo/”，违规发布将会予以处理") ) message:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/OK") otherButtonTitles:nil tapBlock:nil];
            return YES;
        }

        //black list check
        NSArray *blackList = [[self class] contactBlackList];
        __block NSString *blackItem = nil;
        [blackList each:^(id object) {
            if ([[content lowercaseString] containsString:[object lowercaseString]]) {
                blackItem = object;
                return;
            }
        }];

        if (blackItem) {
            [UIAlertView showWithTitle:CONCAT(STR(@"RentPropertyMoreInfo/平台将提供房东联系方式选择，请删除“"), blackItem, STR(@"RentPropertyMoreInfo/”相关信息，违规发布将会予以处理"))  message:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/OK") otherButtonTitles:nil tapBlock:nil];
            return YES;
        }

        //html tag check
        NSString *htmlTagRegext = @"<[^>]*>";
        if ([content isMatch:RX(htmlTagRegext)]) {
            [UIAlertView showWithTitle:STR(@"RentPropertyMoreInfo/请删除HTML相关字符")  message:nil cancelButtonTitle:STR(@"RentPropertyMoreInfo/OK") otherButtonTitles:nil tapBlock:nil];
            return YES;
        }
    }

    return NO;
}

+ (NSArray *)contactBlackList {
    static NSArray *blackList = nil;
    if (blackList == nil) {
        NSString *path = [[NSBundle mainBundle] pathForResource:@"contact-blacklist" ofType:@"csv"];
        NSString* fileContents = [NSString stringWithContentsOfFile:path encoding:NSUTF8StringEncoding error:nil];
        blackList = [fileContents componentsSeparatedByString:@","];
    }
    return blackList;
}


@end
