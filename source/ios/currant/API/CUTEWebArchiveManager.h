//
//  CUTEWebArchiver.h
//  currant
//
//  Created by Foster Yin on 8/31/15.
//  Copyright © 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface CUTEWebArchive : NSObject <NSCoding>

@property (nonatomic, strong) NSData *data;

@property (nonatomic, copy) NSString *MIMEType;

@property (nonatomic, strong) NSURL *URL;

@property (nonatomic, copy) NSString*textEncodingName;

@end

@interface CUTEWebArchiveManager : NSObject

+ (instancetype)sharedInstance;

- (void)archiveURL:(NSURL *)url;

- (CUTEWebArchive *)getWebArchiveWithURL:(NSURL *)url;

@end
