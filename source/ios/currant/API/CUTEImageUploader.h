//
//  CUTEImageUploader.h
//  currant
//
//  Created by Foster Yin on 4/17/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <BFTask.h>

@interface CUTEImageUploader : NSObject

- (BFTask *)updateImage:(NSData*)imageData;

@end
